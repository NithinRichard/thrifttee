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

class SavedSearch(models.Model):
    """Saved search notifications for users."""
    # Can be linked to authenticated user or None for guest users
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='saved_searches')
    email = models.EmailField()  # Required for notifications

    # Search criteria
    query = models.CharField(max_length=255, blank=True)  # Search term
    filters = models.JSONField(default=dict, blank=True)  # Filter criteria (category, price range, etc.)

    # Notification settings
    is_active = models.BooleanField(default=True)
    notification_sent = models.BooleanField(default=False)

    # Metadata
    source = models.CharField(max_length=50, default='zero_results_page')  # Where the search was saved
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_notified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'is_active']),
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        username = self.user.username if self.user else 'Guest'
        return f"Saved search: {username} - '{self.query}' ({self.email})"

    @property
    def is_guest_search(self):
        """Check if this is a guest user search."""
        return self.user is None

    def can_send_notification(self):
        """Check if notification can be sent (rate limiting)."""
        if not self.is_active:
            return False

        # Don't send more than once per day
        if self.last_notified_at:
            from django.utils import timezone
            time_diff = timezone.now() - self.last_notified_at
            if time_diff.total_seconds() < 24 * 60 * 60:  # 24 hours
                return False

        return True

    def mark_notification_sent(self):
        """Mark that a notification has been sent."""
        from django.utils import timezone
        self.notification_sent = True
        self.last_notified_at = timezone.now()
        self.save(update_fields=['notification_sent', 'last_notified_at'])