from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.products.models import ProductReservation, TShirt
from apps.products.utils import get_available_quantity

class CartView(generics.ListAPIView):
    """Cart view placeholder"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({'cart': []})

class AddToCartView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        return Response({'message': 'Added to cart'})

class UpdateCartItemView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, item_id):
        return Response({'message': 'Updated cart item'})

class RemoveFromCartView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, item_id):
        return Response({'message': 'Removed from cart'})

class ClearCartView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        return Response({'message': 'Cart cleared'})

def validate_product_availability(product, user):
    """Check if product is available for purchase by this user"""
    available_qty = get_available_quantity(product)
    
    # Check if user has reservation for this product
    try:
        user_reservation = ProductReservation.objects.get(
            product=product,
            user=user,
            is_active=True
        )
        if not user_reservation.is_expired:
            return True  # User can purchase their reserved items
    except ProductReservation.DoesNotExist:
        pass
    
    # Check if any quantity is available
    return available_qty > 0