from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer
from apps.cart.models import Cart

class OrderListView(generics.ListAPIView):
    """List user orders."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class OrderDetailView(generics.RetrieveAPIView):
    """Get order details."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'order_number'
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class CreateOrderView(generics.CreateAPIView):
    """Create new order from cart."""
    serializer_class = CreateOrderSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Get user's cart
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create order
        order_data = serializer.validated_data
        order_data['user'] = request.user
        order_data['subtotal'] = cart.total_price
        order_data['total_amount'] = cart.total_price  # Add tax/shipping calculation here
        
        order = Order.objects.create(**order_data)
        
        # Create order items from cart
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                tshirt=cart_item.tshirt,
                quantity=cart_item.quantity,
                price=cart_item.tshirt.price,
                product_title=cart_item.tshirt.title,
                product_brand=cart_item.tshirt.brand.name,
                product_size=cart_item.tshirt.size,
                product_color=cart_item.tshirt.color,
            )
        
        # Clear cart
        cart.items.all().delete()
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class CreatePaymentIntentView(generics.GenericAPIView):
    """Create Stripe payment intent."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # This would integrate with Stripe
        # For now, return a mock response
        return Response({
            'client_secret': 'mock_client_secret',
            'payment_intent_id': 'mock_payment_intent'
        })

class ConfirmPaymentView(generics.GenericAPIView):
    """Confirm payment and update order status."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        order_number = request.data.get('order_number')
        payment_intent_id = request.data.get('payment_intent_id')
        
        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
            order.payment_status = 'paid'
            order.status = 'processing'
            order.payment_id = payment_intent_id
            order.save()
            
            return Response({'message': 'Payment confirmed'})
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)