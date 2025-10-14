from django.db import transaction
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem
from .serializers import CartSerializer
from apps.products.models import ProductReservation, TShirt
from apps.products.utils import get_available_quantity
from apps.common.validators import validate_quantity as validate_qty
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


def _parse_quantity(value):
    try:
        return validate_qty(value)
    except ValidationError:
        return None


def _get_or_create_cart_for_request(request):
    """Get or create a cart for authenticated users or guests (session-based)."""
    # Authenticated user
    if request.user and request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart

    # Ensure session exists for guest
    if not hasattr(request, 'session') or not request.session.session_key:
        try:
            request.session.save()
        except Exception:
            pass
    session_key = getattr(request.session, 'session_key', None) or 'guest'

    # Use a synthetic user per session so reservations work per-guest
    username = f"guest_{session_key}"
    guest_user, _ = User.objects.get_or_create(username=username, defaults={})
    if not guest_user.has_usable_password():
        try:
            guest_user.set_unusable_password()
            guest_user.save(update_fields=['password'])
        except Exception:
            pass

    cart, _ = Cart.objects.get_or_create(user=guest_user, defaults={'session_key': session_key})
    if cart.session_key != session_key:
        cart.session_key = session_key
        cart.save(update_fields=['session_key'])
    return cart


def _sync_reservation(product, user, new_quantity):
    """Create/update a ProductReservation for the given user/product.
    Set inactive by deleting when quantity is 0."""
    expires = timezone.now() + timedelta(minutes=15)
    try:
        res = ProductReservation.objects.get(product=product, user=user)
        if new_quantity <= 0:
            res.delete()
        else:
            res.quantity = new_quantity
            res.expires_at = expires
            res.is_active = True
            res.save(update_fields=['quantity', 'expires_at', 'is_active'])
    except ProductReservation.DoesNotExist:
        if new_quantity > 0:
            ProductReservation.objects.create(
                product=product,
                user=user,
                quantity=new_quantity,
                expires_at=expires,
                is_active=True
            )


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
    """Retrieve the current user's or guest's cart."""
    permission_classes = [AllowAny]

    def get(self, request):
        cart = _get_or_create_cart_for_request(request)
        cart = Cart.objects.select_related('user').prefetch_related('items__tshirt').get(pk=cart.pk)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


class AddToCartView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        product_id = request.data.get('product_id')
        quantity_value = request.data.get('quantity', 1)
        
        # Validate product_id
        try:
            product_id = int(product_id)
            if product_id < 1:
                raise ValueError
        except (TypeError, ValueError):
            return Response({'error': 'Invalid product ID.'}, status=status.HTTP_400_BAD_REQUEST)

        quantity = _parse_quantity(quantity_value)
        if quantity is None:
            return Response({'error': 'Quantity must be between 1 and 100.'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(TShirt.objects.select_for_update(), id=product_id, is_available=True)

        cart = _get_or_create_cart_for_request(request)
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

        # Sync reservation quantity for this user/session
        _sync_reservation(product, cart.user, new_quantity)

        cart.refresh_from_db()
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class UpdateCartItemView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def put(self, request, item_id):
        quantity_value = request.data.get('quantity')
        quantity = _parse_quantity(quantity_value)
        if quantity is None:
            return Response({'error': 'Quantity must be a positive integer.'}, status=status.HTTP_400_BAD_REQUEST)

        cart = _get_or_create_cart_for_request(request)
        cart_item = get_object_or_404(CartItem.objects.select_for_update().select_related('tshirt', 'cart'), id=item_id, cart=cart)

        product = cart_item.tshirt
        is_valid, message = _ensure_quantity_available(product, quantity)
        if not is_valid:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = quantity
        cart_item.save(update_fields=['quantity', 'updated_at'])

        # Sync reservation to new quantity
        _sync_reservation(cart_item.tshirt, cart.user, quantity)

        cart.refresh_from_db()
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


class RemoveFromCartView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def delete(self, request, item_id):
        cart = _get_or_create_cart_for_request(request)
        cart_item = CartItem.objects.filter(id=item_id, cart=cart).select_related('tshirt').first()
        if cart_item:
            product = cart_item.tshirt
            cart_item.delete()
            # Remove reservation for this product for this user
            _sync_reservation(product, cart.user, 0)

        cart.refresh_from_db()
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


class ClearCartView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def delete(self, request):
        cart = _get_or_create_cart_for_request(request)
        product_ids = list(cart.items.values_list('tshirt_id', flat=True))
        cart.items.all().delete()
        if product_ids:
            ProductReservation.objects.filter(user=cart.user, product_id__in=product_ids).delete()

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