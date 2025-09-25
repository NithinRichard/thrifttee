from rest_framework import generics, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from decimal import Decimal
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

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer

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

            return Response({
                'razorpay_order_id': razorpay_order['id'],
                'amount': razorpay_order['amount'],
                'currency': razorpay_order['currency'],
                'receipt': razorpay_order['receipt'],
                'key': settings.RAZORPAY_KEY_ID,
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

    @action(detail=False, methods=['post'])
    def verify_payment(self, request):
        """Verify Razorpay payment status."""
        try:
            razorpay_order_id = request.data.get('razorpay_order_id')
            razorpay_payment_id = request.data.get('razorpay_signature')

            if not all([razorpay_order_id, razorpay_payment_id]):
                return Response(
                    {'error': 'Missing required payment verification data'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get order by Razorpay order ID
            try:
                order = Order.objects.get(razorpay_order_id=razorpay_order_id, user=request.user)
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