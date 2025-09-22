from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    """Order item serializer."""
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'tshirt', 'quantity', 'price', 'total_price',
            'product_title', 'product_brand', 'product_size', 'product_color'
        ]

class OrderSerializer(serializers.ModelSerializer):
    """Order serializer."""
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status', 'subtotal',
            'tax_amount', 'shipping_amount', 'total_amount', 'items',
            'shipping_name', 'shipping_email', 'shipping_phone',
            'shipping_address_line1', 'shipping_address_line2',
            'shipping_city', 'shipping_state', 'shipping_postal_code',
            'shipping_country', 'created_at', 'updated_at'
        ]

class CreateOrderSerializer(serializers.ModelSerializer):
    """Create order serializer."""
    
    class Meta:
        model = Order
        fields = [
            'shipping_name', 'shipping_email', 'shipping_phone',
            'shipping_address_line1', 'shipping_address_line2',
            'shipping_city', 'shipping_state', 'shipping_postal_code',
            'shipping_country'
        ]