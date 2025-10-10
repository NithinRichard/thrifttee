from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.products.models import TShirt

User = get_user_model()

class Order(models.Model):
    """Order model with Rupay payment integration."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('razorpay', 'Razorpay'),
        ('card', 'Credit/Debit Card'),
        ('upi', 'UPI'),
        ('netbanking', 'Net Banking'),
        ('wallet', 'Wallet'),
    ]

    # Order Information
    order_number = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')

    # Pricing
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Shipping Information
    shipping_name = models.CharField(max_length=100)
    shipping_email = models.EmailField()
    shipping_phone = models.CharField(max_length=20, blank=True)
    shipping_address_line1 = models.CharField(max_length=255)
    shipping_address_line2 = models.CharField(max_length=255, blank=True)
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)
    shipping_postal_code = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=100, default='India')

    # Payment Information
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='razorpay')

    # Razorpay specific fields
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)  # Razorpay order ID
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)  # Razorpay payment ID
    razorpay_signature = models.CharField(max_length=500, blank=True, null=True)  # Payment signature
    payment_gateway_response = models.JSONField(blank=True, null=True)  # Store full gateway response

    # Legacy payment fields (keeping for backward compatibility)
    payment_id = models.CharField(max_length=100, blank=True)

    # Additional metadata
    currency = models.CharField(max_length=3, default='INR')
    notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_number} - {self.user.username}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            import uuid
            # Use a real datetime for timestamp; created_at isn't set before first save
            now_ts = int((self.created_at or timezone.now()).timestamp())
            timestamp = str(now_ts)
            self.order_number = f"ORD-{timestamp[-6:]}-{uuid.uuid4().hex[:4].upper()}"
        super().save(*args, **kwargs)

    @property
    def is_payment_completed(self):
        return self.payment_status == 'completed'

    @property
    def can_cancel(self):
        return self.status in ['pending', 'processing'] and not self.is_payment_completed

class OrderItem(models.Model):
    """Order item model."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    tshirt = models.ForeignKey(TShirt, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price at time of order
    product_title = models.CharField(max_length=200)
    product_brand = models.CharField(max_length=100)
    product_size = models.CharField(max_length=10)
    product_color = models.CharField(max_length=50)
    
    class Meta:
        ordering = ['id']
    
    def __str__(self):
        return f"{self.quantity}x {self.product_title}"
    
    @property
    def total_price(self):
        return self.quantity * self.price


class ReturnRequest(models.Model):
    """Return/Exchange request model."""
    
    RETURN_TYPES = [
        ('return', 'Return'),
        ('exchange', 'Exchange'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='return_requests')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=RETURN_TYPES, default='return')
    reason = models.CharField(max_length=255)
    comments = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.type.title()} Request for Order {self.order.order_number}'