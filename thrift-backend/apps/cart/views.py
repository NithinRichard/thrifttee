from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from apps.products.models import TShirt

class CartView(generics.RetrieveAPIView):
    """Get cart contents."""
    serializer_class = CartSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        if self.request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=self.request.user)
        else:
            session_key = self.request.session.session_key
            if not session_key:
                self.request.session.create()
                session_key = self.request.session.session_key
            cart, created = Cart.objects.get_or_create(session_key=session_key)
        return cart

class AddToCartView(generics.CreateAPIView):
    """Add item to cart."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        tshirt_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        try:
            tshirt = TShirt.objects.get(id=tshirt_id, is_available=True)
        except TShirt.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get or create cart
        if request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=request.user)
        else:
            session_key = request.session.session_key
            if not session_key:
                request.session.create()
                session_key = request.session.session_key
            cart, created = Cart.objects.get_or_create(session_key=session_key)
        
        # Add or update cart item
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            tshirt=tshirt,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        return Response({
            'message': 'Added to cart',
            'cart': CartSerializer(cart).data
        }, status=status.HTTP_201_CREATED)

class UpdateCartItemView(generics.UpdateAPIView):
    """Update cart item quantity."""
    permission_classes = [AllowAny]
    
    def put(self, request, item_id):
        quantity = int(request.data.get('quantity', 1))
        
        try:
            if request.user.is_authenticated:
                cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
            else:
                session_key = request.session.session_key
                cart_item = CartItem.objects.get(id=item_id, cart__session_key=session_key)
            
            if quantity > 0:
                cart_item.quantity = quantity
                cart_item.save()
                return Response({'message': 'Cart updated'})
            else:
                cart_item.delete()
                return Response({'message': 'Item removed from cart'})
                
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

class RemoveFromCartView(generics.DestroyAPIView):
    """Remove item from cart."""
    permission_classes = [AllowAny]
    
    def delete(self, request, item_id):
        try:
            if request.user.is_authenticated:
                cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
            else:
                session_key = request.session.session_key
                cart_item = CartItem.objects.get(id=item_id, cart__session_key=session_key)

            cart_item.delete()
            return Response({'message': 'Item removed from cart'})

        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)

class ClearCartView(generics.GenericAPIView):
    """Clear all items from cart."""
    permission_classes = [AllowAny]

    def post(self, request):
        """Clear the cart via POST (legacy behavior)."""
        return self._clear_cart(request)

    def delete(self, request):
        """Clear the cart via DELETE to align with REST semantics."""
        return self._clear_cart(request)

    def _clear_cart(self, request):
        if request.user.is_authenticated:
            cart = Cart.objects.filter(user=request.user).first()
        else:
            session_key = request.session.session_key
            cart = Cart.objects.filter(session_key=session_key).first()

        if cart:
            cart.items.all().delete()

        return Response({'message': 'Cart cleared'})