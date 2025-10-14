from rest_framework import generics, status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.db import transaction
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.template.loader import render_to_string
from decimal import Decimal
from apps.products.models import TShirt
import razorpay
import json
import hmac
import hashlib
from .serializers import (
    OrderSerializer,
    CreateOrderSerializer,
    PaymentVerificationSerializer
)
from apps.cart.models import Cart
from .models import Order, OrderItem
from apps.products.utils import reduce_inventory_for_order
from .inventory import InventoryManager
from apps.common.validators import validate_email, validate_phone, validate_pincode, sanitize_html

class OrderViewSet(viewsets.ModelViewSet):
    """Order viewset with Razorpay payment integration."""
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Initialize Razorpay client
        self.razorpay_client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def pending_order(self, request):
        """Check if user has a pending order that needs payment."""
        try:
            # Check if user is authenticated
            if not request.user.is_authenticated:
                return Response({
                    'has_pending_order': False,
                    'message': 'User not authenticated'
                })

            # Look for orders with pending payment status
            pending_orders = Order.objects.filter(
                user=request.user,
                payment_status='pending'
            ).order_by('-created_at')

            if pending_orders.exists():
                order = pending_orders.first()
                return Response({
                    'has_pending_order': True,
                    'order_id': order.id,
                    'razorpay_order_id': order.razorpay_order_id,
                    'amount': int(order.total_amount * 100),  # Convert to paise
                    'currency': order.currency,
                    'key': settings.RAZORPAY_KEY_ID,
                    'order_details': {
                        'subtotal': order.subtotal,
                        'tax_amount': order.tax_amount,
                        'shipping_amount': order.shipping_amount,
                        'total_amount': order.total_amount
                    }
                })
            else:
                return Response({
                    'has_pending_order': False,
                    'message': 'No pending orders found'
                })

        except Exception as e:
            return Response(
                {'error': f'Failed to check pending orders: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def create_razorpay_order(self, request):
        """Create Razorpay order for payment."""
        try:
            # Get cart total
            cart = Cart.objects.get(user=request.user)
            if not cart.items.exists():
                return Response(
                    {'error': 'Cart is empty'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if user already has a pending order
            existing_pending_order = Order.objects.filter(
                user=request.user,
                payment_status='pending'
            ).first()

            if existing_pending_order:
                # Verify order status with Razorpay to ensure it's actually pending
                try:
                    razorpay_order = self.razorpay_client.order.fetch(existing_pending_order.razorpay_order_id)
                    if razorpay_order.get('status') == 'paid':
                        # Order was already paid, update local status and create new order
                        existing_pending_order.payment_status = 'completed'
                        existing_pending_order.status = 'processing'
                        existing_pending_order.save()
                    else:
                        # Order is still pending, reuse it
                        return Response({
                            'razorpay_order_id': existing_pending_order.razorpay_order_id,
                            'amount': int(existing_pending_order.total_amount * 100),
                            'currency': existing_pending_order.currency,
                            'receipt': f'order_{request.user.id}_{int(existing_pending_order.created_at.timestamp())}',
                            'key': settings.RAZORPAY_KEY_ID,
                            'order_id': existing_pending_order.id,
                            'order_details': {
                                'subtotal': existing_pending_order.subtotal,
                                'tax_amount': existing_pending_order.tax_amount,
                                'shipping_amount': existing_pending_order.shipping_amount,
                                'total_amount': existing_pending_order.total_amount
                            },
                            'message': 'Using existing pending order'
                        })
                except Exception as e:
                    print(f'Error verifying Razorpay order: {str(e)}')

            # Calculate totals
            subtotal = cart.total_price
            tax_amount = subtotal * Decimal('0.18')  # 18% GST
            shipping_amount = Decimal('50') if subtotal < Decimal('1000') else Decimal('0')  # Free shipping over ₹1000
            total_amount = subtotal + tax_amount + shipping_amount

            # Convert to paise (Razorpay expects amount in smallest currency unit)
            amount_in_paise = int(total_amount * Decimal('100'))

            # Create Razorpay order
            razorpay_order_data = {
                'amount': amount_in_paise,
                'currency': 'INR',
                'receipt': f'order_{request.user.id}_{int(cart.created_at.timestamp())}',
                'notes': {
                    'user_id': request.user.id,
                    'cart_id': cart.id,
                    'subtotal': str(subtotal),
                    'tax_amount': str(tax_amount),
                    'shipping_amount': str(shipping_amount)
                }
            }

            razorpay_order = self.razorpay_client.order.create(data=razorpay_order_data)

            # Wrap order creation, item cloning, and cart clearing in a single transaction
            with transaction.atomic():
                # Create order record in database
                order = Order.objects.create(
                    user=request.user,
                    order_number=f"ORD-{razorpay_order['id'][-8:]}-{request.user.id}",
                    status='pending',
                    payment_status='pending',
                    subtotal=subtotal,
                    tax_amount=tax_amount,
                    shipping_amount=shipping_amount,
                    total_amount=total_amount,
                    shipping_name=f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
                    shipping_email=request.user.email,
                    shipping_phone=getattr(request.user, 'phone', ''),
                    shipping_address_line1='',
                    shipping_city='',
                    shipping_state='',
                    shipping_postal_code='',
                    shipping_country='India',
                    payment_method='razorpay',
                    razorpay_order_id=razorpay_order['id'],
                    currency='INR'
                )

                # Create order items
                for item in cart.items.all():
                    OrderItem.objects.create(
                        order=order,
                        tshirt=item.tshirt,
                        quantity=item.quantity,
                        price=item.tshirt.price,
                        product_title=item.tshirt.title,
                        product_brand=item.tshirt.brand.name,
                        product_size=item.tshirt.size,
                        product_color=item.tshirt.color
                    )

                # NOTE: Cart is NOT cleared here - only after successful payment
                # This allows users to refresh the page without losing their cart

            return Response({
                'razorpay_order_id': razorpay_order['id'],
                'amount': razorpay_order['amount'],
                'currency': razorpay_order['currency'],
                'receipt': razorpay_order['receipt'],
                'key': settings.RAZORPAY_KEY_ID,
                'order_id': order.id,
                'order_details': {
                    'subtotal': subtotal,
                    'tax_amount': tax_amount,
                    'shipping_amount': shipping_amount,
                    'total_amount': total_amount
                }
            })

        except Cart.DoesNotExist:
            return Response(
                {'error': 'Cart not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to create Razorpay order: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def verify_payment(self, request):
        """Verify Razorpay payment status."""
        try:
            razorpay_order_id = request.data.get('razorpay_order_id')
            razorpay_payment_id = request.data.get('razorpay_payment_id')
            razorpay_signature = request.data.get('razorpay_signature')

            if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
                return Response(
                    {'error': 'Missing required payment verification data'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get order by Razorpay order ID
            try:
                order = Order.objects.get(razorpay_order_id=razorpay_order_id)
                # If authenticated, enforce ownership
                if request.user.is_authenticated and order.user_id != request.user.id:
                    return Response(
                        {'error': 'Order does not belong to the authenticated user'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Order.DoesNotExist:
                return Response(
                    {'error': 'Order not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Verify payment signature
            is_valid_signature = self._verify_razorpay_signature(
                razorpay_order_id, razorpay_payment_id, request.data.get('razorpay_signature')
            )

            if not is_valid_signature:
                order.payment_status = 'failed'
                order.save()
                return Response(
                    {'error': 'Invalid payment signature'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Fetch payment details from Razorpay
            payment_data = self.razorpay_client.payment.fetch(razorpay_payment_id)

            # Update order with payment details
            order.razorpay_payment_id = razorpay_payment_id
            order.razorpay_signature = request.data.get('razorpay_signature')
            order.payment_gateway_response = payment_data

            if payment_data['status'] == 'captured':
                order.payment_status = 'completed'
                order.status = 'processing'
                
                # Send order confirmation email
                try:
                    html_message = render_to_string('emails/order_confirmation.html', {
                        'order': order,
                        'frontend_url': settings.FRONTEND_URL
                    })
                    send_mail(
                        subject=f'Order Confirmation - {order.order_number}',
                        message=f'Your order {order.order_number} has been confirmed!',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[order.user.email],
                        html_message=html_message,
                        fail_silently=True,
                    )
                except Exception as e:
                    print(f"Failed to send order confirmation email: {str(e)}")

                # Reduce product inventory using InventoryManager
                for item in order.items.all():
                    success, error = InventoryManager.reserve_stock(item.tshirt.id, item.quantity)
                    if not success:
                        print(f"Warning: Inventory update failed for {item.product_title}: {error}")

                # Create Shiprocket order for successful payments
                try:
                    from apps.shipping.services import shiprocket_service

                    if shiprocket_service.is_available():
                        # Prepare order items for Shiprocket
                        order_items = []
                        for item in order.items.all():
                            order_items.append({
                                'product': item.tshirt,
                                'quantity': item.quantity
                            })

                        # Prepare shipping address from order data
                        shipping_address = {
                            'name': order.shipping_name,
                            'email': order.shipping_email,
                            'phone': order.shipping_phone,
                            'address': order.shipping_address_line1,
                            'city': order.shipping_city,
                            'state': order.shipping_state,
                            'country': order.shipping_country,
                            'postal_code': order.shipping_postal_code
                        }

                        # Create Shiprocket order
                        shiprocket_result = shiprocket_service.create_shipment(
                            order_data={
                                'order_id': str(order.id),
                                'created_at': order.created_at
                            },
                            order_items=order_items,
                            shipping_address=shipping_address
                        )

                        if shiprocket_result.get('success'):
                            # Update order with Shiprocket tracking info
                            order.shiprocket_order_id = shiprocket_result.get('shiprocket_order_id')
                            order.tracking_number = shiprocket_result.get('tracking_number')
                            order.courier_name = shiprocket_result.get('courier_name')
                            order.awb_number = shiprocket_result.get('awb')
                            order.estimated_delivery = shiprocket_result.get('estimated_delivery')
                            order.status = 'shipped'  # Update to shipped since Shiprocket order is created

                            print(f"✅ Shiprocket order created for order {order.order_number}")
                            print(f"   Shiprocket Order ID: {shiprocket_result.get('shiprocket_order_id')}")
                            print(f"   Tracking Number: {shiprocket_result.get('tracking_number')}")
                            print(f"   Courier: {shiprocket_result.get('courier_name')}")
                        else:
                            print(f"❌ Shiprocket order creation failed for order {order.order_number}: {shiprocket_result.get('error')}")
                            # Don't fail the payment verification if Shiprocket fails
                    else:
                        print(f"⚠️ Shiprocket service not available for order {order.order_number}")

                except Exception as e:
                    print(f"❌ Error creating Shiprocket order for order {order.order_number}: {str(e)}")
                    # Don't fail the payment verification if Shiprocket fails

                # Clear cart only after successful payment
                # Try authenticated user's cart, then order user's cart
                cleared = False
                try:
                    if request.user.is_authenticated:
                        cart = Cart.objects.get(user=request.user)
                        cart.items.all().delete()
                        cleared = True
                except Cart.DoesNotExist:
                    pass
                if not cleared:
                    try:
                        cart = Cart.objects.get(user=order.user)
                        cart.items.all().delete()
                    except Cart.DoesNotExist:
                        pass
            elif payment_data['status'] == 'failed':
                order.payment_status = 'failed'
            else:
                order.payment_status = 'pending'

            order.save()

            return Response({
                'status': 'success',
                'message': 'Payment verified successfully',
                'order_status': order.status,
                'payment_status': order.payment_status,
                'payment_data': payment_data
            })

        except Exception as e:
            return Response(
                {'error': f'Payment verification failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _verify_razorpay_signature(self, order_id, payment_id, signature):
        """Verify Razorpay webhook signature."""
        try:
            # Create expected signature
            expected_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode(),
                f"{order_id}|{payment_id}".encode(),
                hashlib.sha256
            ).hexdigest()

            return expected_signature == signature
        except Exception:
            return False

    @action(detail=False, methods=['post'])
    def create_from_cart(self, request):
        """Create order from user's cart."""
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response(
                {'error': 'Cart not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate totals
        subtotal = cart.total_price
        tax_amount = subtotal * Decimal('0.18')  # 18% GST
        shipping_amount = Decimal('50') if subtotal < Decimal('1000') else Decimal('0')  # Free shipping over ₹1000
        total_amount = subtotal + tax_amount + shipping_amount

        # Prepare order data
        order_data = {
            'customer_info': {
                'name': f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
                'email': request.user.email
            },
            'order_items': [
                {
                    'product': item.tshirt.id,
                    'quantity': item.quantity,
                    'price': item.tshirt.price,
                    'title': item.tshirt.title,
                    'brand': item.tshirt.brand.name,
                    'size': item.tshirt.size,
                    'color': item.tshirt.color
                } for item in cart.items.all()
            ],
            'payment_method': 'rupay',
            'subtotal': subtotal,
            'tax_amount': tax_amount,
            'shipping_amount': shipping_amount,
            'total_amount': total_amount,
            'currency': 'INR'
        }

        # Add shipping address from request if provided
        shipping_fields = [
            'shipping_address_line1', 'shipping_city', 'shipping_state',
            'shipping_postal_code', 'shipping_country'
        ]
        for field in shipping_fields:
            if field in request.data:
                order_data[field] = request.data[field]

        # Create order using the standard create method
        request._full_data = order_data
        return self.create(request)

class LegacyOrderViews:
    """Legacy order views for backward compatibility."""

    @staticmethod
    def create_payment_intent(request):
        """Create payment intent for various gateways."""
        payment_method = request.data.get('payment_method', 'rupay')

        if payment_method == 'rupay':
            return JsonResponse({
                'client_secret': 'rupay_mock_client_secret',
                'payment_intent_id': f'rupay_pi_{request.user.id}',
                'gateway': 'rupay'
            })

        return JsonResponse({
            'client_secret': 'mock_client_secret',
            'payment_intent_id': 'mock_payment_intent'
        })

    @staticmethod
    def confirm_payment(request):
        """Confirm payment completion."""
        try:
            payment_id = request.data.get('payment_id')
            order_id = request.data.get('order_id')

            if not payment_id or not order_id:
                return JsonResponse(
                    {'error': 'Missing payment_id or order_id'},
                    status=400
                )

            # Get order by ID
            try:
                order = Order.objects.get(id=order_id, user=request.user)
            except Order.DoesNotExist:
                return JsonResponse(
                    {'error': 'Order not found'},
                    status=404
                )

            # Update order status
            order.payment_status = 'completed'
            order.status = 'processing'
            order.save()

            # Reduce product inventory for successful orders
            try:
                inventory_result = reduce_inventory_for_order(order)
                print(f"Legacy: Inventory reduced for order {order.order_number}: {inventory_result['total_products_updated']} products updated")
            except ValueError as e:
                # Log the error but don't fail the payment confirmation
                print(f"Legacy Warning: Inventory reduction failed for order {order.order_number}: {str(e)}")
            except Exception as e:
                print(f"Legacy Warning: Unexpected error during inventory reduction for order {order.order_number}: {str(e)}")

            return JsonResponse({
                'status': 'success',
                'message': 'Payment confirmed successfully',
                'order_id': order.id,
                'order_status': order.status,
                'payment_status': order.payment_status
            })

        except Exception as e:
            return JsonResponse(
                {'error': f'Payment confirmation failed: {str(e)}'},
                status=500
            )

    @staticmethod
    @method_decorator(csrf_exempt)
    def razorpay_webhook(request):
        """Handle Razorpay webhook events."""
        if request.method != 'POST':
            return HttpResponse('Method not allowed', status=405)

        try:
            # Get the webhook payload
            payload = json.loads(request.body.decode('utf-8'))

            # Verify webhook signature
            received_signature = request.META.get('HTTP_X_RAZORPAY_SIGNATURE', '')
            expected_signature = hmac.new(
                settings.RAZORPAY_WEBHOOK_SECRET.encode(),
                request.body,
                hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(expected_signature, received_signature):
                return HttpResponse('Invalid signature', status=400)

            # Process webhook event
            event_type = payload.get('event')
            payment_data = payload.get('payload', {}).get('payment', {})

            if event_type == 'payment.captured':
                # Payment successful
                razorpay_payment_id = payment_data.get('entity', {}).get('id')
                if razorpay_payment_id:
                    try:
                        order = Order.objects.get(razorpay_payment_id=razorpay_payment_id)
                        order.payment_status = 'completed'
                        order.status = 'processing'
                        order.payment_gateway_response = payment_data
                        order.save()

                        # Create Shiprocket order for successful webhook payments
                        try:
                            from apps.shipping.services import shiprocket_service

                            if shiprocket_service.is_available():
                                # Prepare order items for Shiprocket
                                order_items = []
                                for item in order.items.all():
                                    order_items.append({
                                        'product': item.tshirt,
                                        'quantity': item.quantity
                                    })

                                # Prepare shipping address from order data
                                shipping_address = {
                                    'name': order.shipping_name,
                                    'email': order.shipping_email,
                                    'phone': order.shipping_phone,
                                    'address': order.shipping_address_line1,
                                    'city': order.shipping_city,
                                    'state': order.shipping_state,
                                    'country': order.shipping_country,
                                    'postal_code': order.shipping_postal_code
                                }

                                # Create Shiprocket order
                                shiprocket_result = shiprocket_service.create_shipment(
                                    order_data={
                                        'order_id': str(order.id),
                                        'created_at': order.created_at
                                    },
                                    order_items=order_items,
                                    shipping_address=shipping_address
                                )

                                if shiprocket_result.get('success'):
                                    # Update order with Shiprocket tracking info
                                    order.shiprocket_order_id = shiprocket_result.get('shiprocket_order_id')
                                    order.tracking_number = shiprocket_result.get('tracking_number')
                                    order.courier_name = shiprocket_result.get('courier_name')
                                    order.awb_number = shiprocket_result.get('awb')
                                    order.estimated_delivery = shiprocket_result.get('estimated_delivery')
                                    order.status = 'shipped'
                                    order.save()

                                    print(f"✅ Webhook: Shiprocket order created for order {order.order_number}")
                                else:
                                    print(f"❌ Webhook: Shiprocket order creation failed for order {order.order_number}: {shiprocket_result.get('error')}")
                            else:
                                print(f"⚠️ Webhook: Shiprocket service not available for order {order.order_number}")

                        except Exception as e:
                            print(f"❌ Webhook: Error creating Shiprocket order for order {order.order_number}: {str(e)}")

                        # Reduce product inventory for successful orders
                        try:
                            inventory_result = reduce_inventory_for_order(order)
                            print(f"Webhook: Inventory reduced for order {order.order_number}: {inventory_result['total_products_updated']} products updated")
                        except ValueError as e:
                            # Log the error but don't fail the webhook processing
                            print(f"Webhook Warning: Inventory reduction failed for order {order.order_number}: {str(e)}")
                        except Exception as e:
                            print(f"Webhook Warning: Unexpected error during inventory reduction for order {order.order_number}: {str(e)}")

                        # Clear user's cart
                        try:
                            cart = Cart.objects.get(user=order.user)
                            cart.items.all().delete()
                        except Cart.DoesNotExist:
                            pass

                    except Order.DoesNotExist:
                        pass  # Order not found, might be a duplicate webhook

            elif event_type == 'payment.failed':
                # Payment failed
                razorpay_payment_id = payment_data.get('entity', {}).get('id')
                if razorpay_payment_id:
                    try:
                        order = Order.objects.get(razorpay_payment_id=razorpay_payment_id)
                        order.payment_status = 'failed'
                        order.payment_gateway_response = payment_data
                        order.save()
                    except Order.DoesNotExist:
                        pass

            return HttpResponse('Webhook processed successfully', status=200)

        except Exception as e:
            return HttpResponse(f'Webhook processing error: {str(e)}', status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_guest_order(request):
    """Create an order for a guest user (unauthenticated).

    Expected payload:
    {
        "email": "guest@example.com",
        "shipping_address": {
            "name": "John Doe",
            "phone": "9876543210",
            "address": "123 Street",
            "city": "City",
            "state": "ST",
            "postal_code": "123456",
            "country": "IN"
        },
        "items": [
            {"product": 1, "quantity": 2, "price": 499.99, "title": "...", "brand": "...", "size": "M", "color": "Black"},
            ...
        ],
        "subtotal": 0, "tax_amount": 0, "shipping_amount": 0, "total_amount": 0,
        "is_guest_checkout": true
    }
    """
    try:
        data = request.data or {}
        email = validate_email((data.get('email') or '').strip())
        shipping = data.get('shipping_address') or {}
        items = data.get('items') or data.get('order_items') or []

        if not email:
            return Response({'success': False, 'message': 'Valid email is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure we have at least one item
        if not items:
            return Response({'success': False, 'message': 'No items provided for order'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate shipping info
        phone = validate_phone(shipping.get('phone', ''))
        postal_code = validate_pincode(shipping.get('postal_code', ''))
        
        # Create or get a pseudo-user for guest by email
        first_name = ''
        last_name = ''
        full_name = sanitize_html((shipping.get('name') or '').strip())
        if full_name:
            parts = full_name.split()
            first_name = sanitize_html(parts[0])
            last_name = sanitize_html(' '.join(parts[1:])) if len(parts) > 1 else ''

        user = User.objects.filter(email=email).first()
        if not user:
            base_username = email.split('@')[0][:20] or 'guest'
            suffix = hashlib.sha1(email.encode()).hexdigest()[:6]
            username = f"{base_username}_{suffix}"
            user = User.objects.create(username=username, email=email, first_name=first_name, last_name=last_name)
            user.set_unusable_password()
            user.save()

        # Build order monetary totals
        try:
            subtotal = Decimal(str(data.get('subtotal'))) if data.get('subtotal') is not None else None
        except Exception:
            subtotal = None

        # If subtotal not provided, derive from items (prefer DB price if product id present)
        computed_subtotal = Decimal('0.00')
        normalized_items = []
        for it in items:
            product_id = it.get('product') or it.get('product_id') or it.get('tshirt')
            quantity = int(it.get('quantity') or 1)
            title = it.get('title') or ''
            brand = it.get('brand') or ''
            size = it.get('size') or ''
            color = it.get('color') or ''

            unit_price = it.get('price')
            tshirt_obj = None
            if product_id:
                try:
                    tshirt_obj = TShirt.objects.get(id=product_id)
                    # Prefer DB price
                    unit_price = tshirt_obj.price
                    title = title or tshirt_obj.title
                    brand = brand or (getattr(tshirt_obj.brand, 'name', None) or str(getattr(tshirt_obj, 'brand', '')))
                    size = size or tshirt_obj.size
                    color = color or tshirt_obj.color
                except TShirt.DoesNotExist:
                    tshirt_obj = None

            # Fallback if price still missing
            try:
                unit_price = Decimal(str(unit_price))
            except Exception:
                unit_price = Decimal('0.00')

            line_total = unit_price * Decimal(str(quantity))
            computed_subtotal += line_total
            normalized_items.append({
                'tshirt': tshirt_obj,
                'product_id': product_id,
                'quantity': quantity,
                'price': unit_price,
                'title': title,
                'brand': brand,
                'size': size,
                'color': color,
            })

        if subtotal is None:
            subtotal = computed_subtotal.quantize(Decimal('0.01'))

        # Tax and shipping defaults
        try:
            tax_amount = Decimal(str(data.get('tax_amount'))) if data.get('tax_amount') is not None else None
        except Exception:
            tax_amount = None
        if tax_amount is None:
            tax_amount = (subtotal * Decimal('0.18')).quantize(Decimal('0.01'))

        try:
            shipping_amount = Decimal(str(data.get('shipping_amount'))) if data.get('shipping_amount') is not None else None
        except Exception:
            shipping_amount = None
        if shipping_amount is None:
            shipping_amount = Decimal('0.00') if subtotal >= Decimal('1000') else Decimal('50.00')

        try:
            total_amount = Decimal(str(data.get('total_amount'))) if data.get('total_amount') is not None else None
        except Exception:
            total_amount = None
        if total_amount is None:
            total_amount = (subtotal + tax_amount + shipping_amount).quantize(Decimal('0.01'))

        # Create order and items atomically
        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                status='pending',
                payment_status='pending',
                subtotal=subtotal,
                tax_amount=tax_amount,
                shipping_amount=shipping_amount,
                total_amount=total_amount,
                shipping_name=full_name or user.get_full_name() or user.username,
                shipping_email=email,
                shipping_phone=phone,
                shipping_address_line1=sanitize_html(str(shipping.get('address') or '')),
                shipping_city=sanitize_html(str(shipping.get('city') or '')),
                shipping_state=sanitize_html(str(shipping.get('state') or '')),
                shipping_postal_code=postal_code,
                shipping_country='India',
                payment_method='razorpay',
                currency='INR'
            )

            for ni in normalized_items:
                OrderItem.objects.create(
                    order=order,
                    tshirt=ni['tshirt'],
                    quantity=ni['quantity'],
                    price=ni['price'],
                    product_title=ni['title'] or 'Unknown Product',
                    product_brand=str(ni['brand'] or ''),
                    product_size=str(ni['size'] or ''),
                    product_color=str(ni['color'] or '')
                )

        return Response({'success': True, 'order_id': order.id}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'success': False, 'message': f'Failed to create guest order: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_return_request(request):
    """Create a return/exchange request"""
    from django.core.mail import send_mail
    from .models import ReturnRequest
    
    data = request.data
    
    try:
        order = Order.objects.get(
            order_number=data.get('orderId'),
            user=request.user
        )
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    return_request = ReturnRequest.objects.create(
        order=order,
        user=request.user,
        reason=sanitize_html(data.get('reason', '')),
        type=data.get('type', 'return'),
        comments=sanitize_html(data.get('comments', ''))
    )
    
    send_mail(
        subject=f'Return Request Received - {order.order_number}',
        message=f'We received your return request. We\'ll email you a return label within 24 hours.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[request.user.email],
        fail_silently=True,
    )
    
    return Response({
        'message': 'Return request submitted successfully',
        'request_id': return_request.id
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_guest_payment(request):
    """Create a Razorpay order for a guest order (unauthenticated)."""
    try:
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({'success': False, 'message': 'order_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'success': False, 'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        # Initialize Razorpay client
        razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        amount_in_paise = int(order.total_amount * Decimal('100'))
        receipt = f"guest_order_{order.id}_{int(order.created_at.timestamp())}"

        razorpay_order = razorpay_client.order.create(data={
            'amount': amount_in_paise,
            'currency': 'INR',
            'receipt': receipt,
            'notes': {
                'order_id': str(order.id),
                'user_id': order.user.id,
            }
        })

        order.razorpay_order_id = razorpay_order['id']
        order.payment_status = 'pending'
        order.save(update_fields=['razorpay_order_id', 'payment_status', 'updated_at'])

        return Response({
            'success': True,
            'razorpay_order_id': razorpay_order['id'],
            'amount': razorpay_order['amount'],
            'currency': razorpay_order['currency'],
            'receipt': razorpay_order['receipt'],
            'key': settings.RAZORPAY_KEY_ID,
            'order_id': order.id,
            'order_details': {
                'subtotal': order.subtotal,
                'tax_amount': order.tax_amount,
                'shipping_amount': order.shipping_amount,
                'total_amount': order.total_amount
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'success': False, 'message': f'Failed to create guest payment: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)