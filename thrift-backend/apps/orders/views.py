from rest_framework import generics, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.conf import settings
import requests
import json
from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    CreateOrderSerializer,
    PaymentVerificationSerializer
)
from apps.cart.models import Cart

class OrderViewSet(viewsets.ModelViewSet):
    """Order viewset with Rupay payment integration."""
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        """Create new order with Rupay payment integration."""
        serializer = CreateOrderSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        # Create order
        order = serializer.save()

        # Update order status based on payment status
        if order.payment_status == 'completed':
            order.status = 'processing'

        order.save()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['post'])
    def verify_payment(self, request):
        """Verify Rupay payment status."""
        serializer = PaymentVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        transaction_id = serializer.validated_data['transaction_id']
        order_id = serializer.validated_data['order_id']

        try:
            order = Order.objects.get(id=order_id, user=request.user)

            # Integrate with Rupay gateway for verification
            verification_result = self._verify_rupay_payment(transaction_id, order)

            if verification_result['success']:
                order.payment_status = 'completed'
                order.status = 'processing'
                order.save()

                return Response({
                    'status': 'success',
                    'message': 'Payment verified successfully',
                    'order_status': order.status,
                    'payment_status': order.payment_status
                })
            else:
                return Response({
                    'status': 'error',
                    'message': verification_result['message']
                }, status=status.HTTP_400_BAD_REQUEST)

        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    def _verify_rupay_payment(self, transaction_id, order):
        """Verify payment with Rupay gateway."""
        try:
            # Rupay gateway verification endpoint
            rupay_gateway_url = getattr(settings, 'RUPAY_GATEWAY_URL', 'https://test-rupay.gateway.com')

            # Prepare verification request
            verification_data = {
                'transaction_id': transaction_id,
                'merchant_id': getattr(settings, 'RUPAY_MERCHANT_ID', 'demo_merchant'),
                'order_id': order.order_number,
                'amount': str(order.total_amount)
            }

            # Make request to Rupay gateway
            response = requests.post(
                f'{rupay_gateway_url}/verify',
                json=verification_data,
                headers={
                    'Content-Type': 'application/json',
                    'X-API-Key': getattr(settings, 'RUPAY_API_KEY', 'demo_key')
                },
                timeout=30
            )

            if response.status_code == 200:
                verification_response = response.json()

                # Store gateway response
                order.payment_gateway_response = verification_response
                order.save()

                return {
                    'success': True,
                    'data': verification_response
                }
            else:
                return {
                    'success': False,
                    'message': f'Gateway verification failed: {response.status_code}'
                }

        except requests.RequestException as e:
            # For demo purposes, simulate successful verification
            if settings.DEBUG:
                return {
                    'success': True,
                    'data': {
                        'transaction_id': transaction_id,
                        'status': 'success',
                        'amount': str(order.total_amount),
                        'currency': 'INR'
                    }
                }

            return {
                'success': False,
                'message': f'Gateway connection error: {str(e)}'
            }

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
        tax_amount = subtotal * 0.18  # 18% GST
        shipping_amount = 50 if subtotal < 1000 else 0  # Free shipping over ₹1000
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
            return Response({
                'client_secret': 'rupay_mock_client_secret',
                'payment_intent_id': f'rupay_pi_{request.user.id}',
                'gateway': 'rupay'
            })

        return Response({
            'client_secret': 'mock_client_secret',
            'payment_intent_id': 'mock_payment_intent'
        })

    @staticmethod
    def confirm_payment(request):
        """Confirm payment and update order status."""
        order_number = request.data.get('order_number')
        payment_intent_id = request.data.get('payment_intent_id')

        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
            order.payment_status = 'completed'
            order.status = 'processing'
            order.payment_id = payment_intent_id
            order.save()

            return Response({'message': 'Payment confirmed'})
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )