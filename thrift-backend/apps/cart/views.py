from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem
from .serializers import CartSerializer
from apps.products.models import ProductReservation, TShirt
from apps.products.utils import get_available_quantity


def _parse_quantity(value):
    try:
        quantity = int(value)
    except (TypeError, ValueError):
        return None

    if quantity < 1:
        return None
    return quantity


def _get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


def _ensure_quantity_available(product, desired_quantity, existing_quantity=0):
    """Ensure the desired quantity respects stock and current availability."""
    max_quantity = product.quantity or 0
    if max_quantity < 1:
        return False, f"{product.title} is currently out of stock."

    if desired_quantity > max_quantity:
        return False, f"Only {max_quantity} unit(s) of {product.title} are available."

    available_qty = get_available_quantity(product)
    incremental_needed = max(desired_quantity - existing_quantity, 0)

    if incremental_needed > available_qty:
        if available_qty <= 0:
            message = f"No additional stock of {product.title} is available right now."
        else:
            message = f"Only {available_qty} additional unit(s) of {product.title} can be added."
        return False, message

    return True, None


class CartView(APIView):
    """Retrieve the authenticated user's cart."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = _get_or_create_cart(request.user)
        cart = Cart.objects.select_related('user').prefetch_related('items__tshirt').get(pk=cart.pk)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        product_id = request.data.get('product_id')
        quantity_value = request.data.get('quantity', 1)

        quantity = _parse_quantity(quantity_value)
        if quantity is None:
            return Response({'error': 'Quantity must be a positive integer.'}, status=status.HTTP_400_BAD_REQUEST)

        if not product_id:
            return Response({'error': 'Product ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(TShirt.objects.select_for_update(), id=product_id, is_available=True)

        cart = _get_or_create_cart(request.user)
        cart_item, created = CartItem.objects.select_for_update().get_or_create(
            cart=cart,
            tshirt=product,
            defaults={'quantity': 0}
        )

        new_quantity = cart_item.quantity + quantity

        is_valid, message = _ensure_quantity_available(product, new_quantity, existing_quantity=cart_item.quantity)
        if not is_valid:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = new_quantity
        cart_item.save(update_fields=['quantity', 'updated_at'])

        cart.refresh_from_db()
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def put(self, request, item_id):
        quantity_value = request.data.get('quantity')
        quantity = _parse_quantity(quantity_value)
        if quantity is None:
            return Response({'error': 'Quantity must be a positive integer.'}, status=status.HTTP_400_BAD_REQUEST)

        cart = _get_or_create_cart(request.user)
        cart_item = get_object_or_404(CartItem.objects.select_for_update().select_related('tshirt', 'cart'), id=item_id, cart=cart)

        product = cart_item.tshirt
        is_valid, message = _ensure_quantity_available(product, quantity)
        if not is_valid:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = quantity
        cart_item.save(update_fields=['quantity', 'updated_at'])

        cart.refresh_from_db()
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


class RemoveFromCartView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def delete(self, request, item_id):
        cart = _get_or_create_cart(request.user)
        cart_item = CartItem.objects.filter(id=item_id, cart=cart).first()
        if cart_item:
            cart_item.delete()

        cart.refresh_from_db()
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


class ClearCartView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def delete(self, request):
        cart = _get_or_create_cart(request.user)
        cart.items.all().delete()

        cart.refresh_from_db()
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


def validate_product_availability(product, user):
    """Check if product is available for purchase by this user."""
    available_qty = get_available_quantity(product)

    try:
        user_reservation = ProductReservation.objects.get(
            product=product,
            user=user,
            is_active=True
        )
        if not user_reservation.is_expired:
            return True
    except ProductReservation.DoesNotExist:
        pass

    return available_qty > 0