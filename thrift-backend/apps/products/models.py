from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Brand(models.Model):
    """Brand model for t-shirt brands."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Category(models.Model):
    """Category model for t-shirt categories."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Categories'
    
    def __str__(self):
        return self.name

class TShirt(models.Model):
    """Main T-Shirt model."""
    
    CONDITION_CHOICES = [
        ('excellent', 'Excellent - Like new, no visible wear'),
        ('very_good', 'Very Good - Minor signs of wear'),
        ('good', 'Good - Some visible wear but good condition'),
        ('fair', 'Fair - Noticeable wear but still wearable'),
    ]
    
    SIZE_CHOICES = [
        ('xs', 'XS'),
        ('s', 'S'),
        ('m', 'M'),
        ('l', 'L'),
        ('xl', 'XL'),
        ('xxl', 'XXL'),
        ('xxxl', 'XXXL'),
    ]
    
    GENDER_CHOICES = [
        ('unisex', 'Unisex'),
        ('men', 'Men'),
        ('women', 'Women'),
        ('kids', 'Kids'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='tshirts')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='tshirts')
    
    # Physical Attributes
    size = models.CharField(max_length=10, choices=SIZE_CHOICES)
    color = models.CharField(max_length=50)
    material = models.CharField(max_length=100, help_text="e.g., 100% Cotton, 50% Cotton 50% Polyester")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='unisex')
    
    # Condition and Pricing
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Availability
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    quantity = models.PositiveIntegerField(default=1)
    
    # SEO and Marketing
    meta_description = models.CharField(max_length=160, blank=True)
    tags = models.CharField(max_length=200, blank=True, help_text="Comma-separated tags")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Images
    primary_image = models.ImageField(upload_to='tshirts/primary/', help_text="Main product image")
    image_2 = models.ImageField(upload_to='tshirts/', blank=True, null=True)
    image_3 = models.ImageField(upload_to='tshirts/', blank=True, null=True)
    image_4 = models.ImageField(upload_to='tshirts/', blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_available', 'is_featured']),
            models.Index(fields=['brand', 'size']),
            models.Index(fields=['price']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.brand.name} - {self.title} ({self.size})"
    
    @property
    def discount_percentage(self):
        """Calculate discount percentage if original price exists."""
        if self.original_price and self.original_price > self.price:
            return round(((self.original_price - self.price) / self.original_price) * 100)
        return 0
    
    @property
    def all_images(self):
        """Return list of all non-null images."""
        images = [self.primary_image]
        for img in [self.image_2, self.image_3, self.image_4]:
            if img:
                images.append(img)
        return images
    
    
class TShirtReview(models.Model):
    """Review model for t-shirts."""
    tshirt = models.ForeignKey(TShirt, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    comment = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['tshirt', 'user']  # One review per user per product
    
    def __str__(self):
        return f"{self.user.username} - {self.tshirt.title} ({self.rating}/5)"
