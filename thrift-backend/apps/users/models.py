from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """Extended user profile model."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Personal Information
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Address Information
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True, default='US')
    
    # Preferences
    newsletter_subscription = models.BooleanField(default=True)
    size_preference = models.CharField(max_length=10, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile for {self.user.username}"

class Wishlist(models.Model):
    """User wishlist model."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    tshirt = models.ForeignKey('products.TShirt', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'tshirt']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.tshirt.title}"