from django.db import transaction
from apps.products.models import TShirt

class InventoryManager:
    """Manages inventory operations to prevent overselling."""
    
    @staticmethod
    @transaction.atomic
    def reserve_stock(product_id, quantity):
        """Reserve stock for a product. Returns True if successful."""
        try:
            product = TShirt.objects.select_for_update().get(id=product_id)
            
            if product.quantity >= quantity and product.is_available:
                product.quantity -= quantity
                if product.quantity == 0:
                    product.is_available = False
                product.save()
                return True, None
            return False, "Insufficient stock"
        except TShirt.DoesNotExist:
            return False, "Product not found"
    
    @staticmethod
    @transaction.atomic
    def release_stock(product_id, quantity):
        """Release reserved stock back to inventory."""
        try:
            product = TShirt.objects.select_for_update().get(id=product_id)
            product.quantity += quantity
            if product.quantity > 0:
                product.is_available = True
            product.save()
            return True
        except TShirt.DoesNotExist:
            return False
    
    @staticmethod
    def check_availability(product_id, quantity):
        """Check if product has sufficient stock."""
        try:
            product = TShirt.objects.get(id=product_id)
            return product.is_available and product.quantity >= quantity
        except TShirt.DoesNotExist:
            return False
