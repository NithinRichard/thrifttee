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


def reduce_inventory_for_order(order):
    """Reduce product inventory based on order items.
    
    Args:
        order: Order instance with related order items
        
    Returns:
        dict: Status information about the inventory reduction
        
    Raises:
        ValueError: If inventory reduction would result in negative quantities
    """
    from django.db import transaction
    from .models import TShirt
    
    updated_products = []
    errors = []
    
    with transaction.atomic():
        # Get all order items with their products
        order_items = order.items.select_related('tshirt').all()
        
        for item in order_items:
            if not item.tshirt:
                # Product was deleted, skip inventory reduction
                errors.append(f"Product for item '{item.product_title}' no longer exists")
                continue
                
            product = item.tshirt
            ordered_quantity = item.quantity
            
            # Lock the product for update to prevent race conditions
            product = TShirt.objects.select_for_update().get(id=product.id)
            
            # Check if we have enough inventory
            if product.quantity < ordered_quantity:
                error_msg = (
                    f"Insufficient inventory for '{product.title}'. "
                    f"Available: {product.quantity}, Ordered: {ordered_quantity}"
                )
                errors.append(error_msg)
                continue
            
            # Reduce the inventory
            new_quantity = product.quantity - ordered_quantity
            product.quantity = new_quantity
            
            # Set availability based on remaining quantity
            if new_quantity <= 0:
                product.is_available = False
                product.quantity = 0  # Ensure it doesn't go negative
            
            product.save(update_fields=['quantity', 'is_available'])
            updated_products.append({
                'product_id': product.id,
                'product_title': product.title,
                'previous_quantity': product.quantity + ordered_quantity,
                'new_quantity': product.quantity,
                'ordered_quantity': ordered_quantity,
                'is_available': product.is_available
            })
    
    # If there were any errors, raise an exception
    if errors:
        raise ValueError(f"Inventory reduction failed: {'; '.join(errors)}")
    
    return {
        'success': True,
        'updated_products': updated_products,
        'total_products_updated': len(updated_products)
    }
