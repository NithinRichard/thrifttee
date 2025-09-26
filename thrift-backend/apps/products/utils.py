from django.db.models import Sum
from django.utils import timezone
from .models import ProductReservation

def get_available_quantity(product):
    """Get available quantity for a product considering active reservations."""
    total_reserved = ProductReservation.objects.filter(
        product=product,
        is_active=True,
        expires_at__gt=timezone.now()
    ).aggregate(total=Sum('quantity'))['total'] or 0
    
    return max(0, product.quantity - total_reserved)

def can_reserve_quantity(product, user, requested_quantity=1):
    """Check if user can reserve the requested quantity."""
    available = get_available_quantity(product)
    
    # For unique items (quantity = 1), only allow if no one else has reserved it
    if product.quantity == 1:
        # Check if anyone else has an active reservation
        other_reservations = ProductReservation.objects.filter(
            product=product,
            is_active=True,
            expires_at__gt=timezone.now()
        ).exclude(user=user)
        
        if other_reservations.exists():
            return False
        
        # User can reserve if no one else has it
        return requested_quantity <= 1
    
    # For multiple quantity items, use normal logic
    # If user already has a reservation, add their current quantity to available
    try:
        existing = ProductReservation.objects.get(
            product=product, 
            user=user, 
            is_active=True,
            expires_at__gt=timezone.now()
        )
        available += existing.quantity
    except ProductReservation.DoesNotExist:
        pass
    
    return available >= requested_quantity