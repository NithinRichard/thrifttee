from rest_framework import serializers
from .models import Cart, CartItem

class CartItemSerializer(serializers.ModelSerializer):
    """Cart item serializer."""
    tshirt_title = serializers.CharField(source='tshirt.title', read_only=True)
    tshirt_price = serializers.DecimalField(source='tshirt.price', max_digits=10, decimal_places=2, read_only=True)
    tshirt_brand = serializers.CharField(source='tshirt.brand.name', read_only=True)
    tshirt_category = serializers.CharField(source='tshirt.category.name', read_only=True)
    tshirt_image = serializers.ImageField(source='tshirt.primary_image', read_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'tshirt_title', 'tshirt_price', 'tshirt_brand', 'tshirt_category', 'tshirt_image', 'quantity', 'total_price', 'created_at']

class CartSerializer(serializers.ModelSerializer):
    """Cart serializer."""
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_items', 'total_price', 'created_at', 'updated_at']