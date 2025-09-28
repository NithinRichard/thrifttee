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
        ('new_with_tags', 'New with Tags - Brand new, never worn'),
        ('new_without_tags', 'New without Tags - New, never worn but tags removed'),
        ('excellent', 'Excellent - Like new, minimal signs of wear'),
        ('very_good', 'Very Good - Light wear, well-maintained'),
        ('good', 'Good - Moderate wear, still in good shape'),
        ('fair', 'Fair - Visible wear but functional'),
        ('poor', 'Poor - Heavy wear, for parts or repair only'),
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
    
    # Enhanced Condition Reporting
    condition_notes = models.TextField(blank=True, help_text="Detailed description of condition, flaws, repairs, etc.")
    has_stains = models.BooleanField(default=False, help_text="Any visible stains")
    has_holes = models.BooleanField(default=False, help_text="Any holes or tears")
    has_fading = models.BooleanField(default=False, help_text="Color fading or discoloration")
    has_pilling = models.BooleanField(default=False, help_text="Fabric pilling or wear")
    has_repairs = models.BooleanField(default=False, help_text="Any repairs or alterations")
    condition_confidence = models.CharField(
        max_length=20,
        choices=[
            ('certain', 'Very Confident'),
            ('mostly_certain', 'Mostly Confident'),
            ('unsure', 'Somewhat Unsure'),
            ('guessing', 'Best Guess'),
        ],
        default='certain',
        help_text="How confident are you in this condition assessment?"
    )

    # Detailed Measurements (in inches)
    pit_to_pit = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Chest width (pit to pit)")
    shoulder_to_shoulder = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Shoulder width")
    front_length = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Front length from shoulder")
    back_length = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Back length from shoulder")
    sleeve_length = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Sleeve length")
    weight_grams = models.PositiveIntegerField(null=True, blank=True, help_text="Item weight in grams")

    # Enhanced Photo System
    condition_photo_1 = models.ImageField(upload_to='tshirts/condition/', blank=True, null=True, help_text="Close-up of any flaws/damage")
    condition_photo_2 = models.ImageField(upload_to='tshirts/condition/', blank=True, null=True, help_text="Care tag/label")
    condition_photo_3 = models.ImageField(upload_to='tshirts/condition/', blank=True, null=True, help_text="Material/fabric close-up")
    condition_photo_4 = models.ImageField(upload_to='tshirts/condition/', blank=True, null=True, help_text="Additional detail photo")

    # Condition Verification
    condition_verified = models.BooleanField(default=False, help_text="Has this condition been verified by staff?")
    condition_verifier = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_conditions')
    condition_verified_at = models.DateTimeField(null=True, blank=True)
    
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
        """Return list of all non-null images including condition photos."""
        images = [self.primary_image]
        for img in [self.image_2, self.image_3, self.image_4]:
            if img:
                images.append(img)

        # Add condition photos
        for img in [self.condition_photo_1, self.condition_photo_2, self.condition_photo_3, self.condition_photo_4]:
            if img:
                images.append(img)

        return images
    

    @property
    def condition_photos(self):
        """Return list of condition-specific photos."""
        photos = []
        for i, img in enumerate([self.condition_photo_1, self.condition_photo_2, self.condition_photo_3, self.condition_photo_4], 1):
            if img:
                photos.append({
                    'url': img.url,
                    'description': f'Condition detail {i}'
                })
        return photos

    @property
    def has_detailed_condition_info(self):
        """Check if item has detailed condition information."""
        has_measurements = any([self.pit_to_pit, self.shoulder_to_shoulder, self.front_length, self.back_length, self.sleeve_length])
        has_condition_details = any([self.has_stains, self.has_holes, self.has_fading, self.has_pilling, self.has_repairs])
        has_condition_notes = bool(self.condition_notes.strip())
        has_condition_photos = any([self.condition_photo_1, self.condition_photo_2, self.condition_photo_3, self.condition_photo_4])

        return has_measurements or has_condition_details or has_condition_notes or has_condition_photos

    @property
    def condition_badge_class(self):
        """Return CSS class for condition badge."""
        condition_map = {
            'new_with_tags': 'bg-green-100 text-green-800',
            'new_without_tags': 'bg-green-100 text-green-800',
            'excellent': 'bg-blue-100 text-blue-800',
            'very_good': 'bg-yellow-100 text-yellow-800',
            'good': 'bg-orange-100 text-orange-800',
            'fair': 'bg-red-100 text-red-800',
            'poor': 'bg-gray-100 text-gray-800',
        }
        return condition_map.get(self.condition, 'bg-gray-100 text-gray-800')

    def verify_condition(self, verifier):
        """Mark condition as verified by staff."""
        from django.utils import timezone
        self.condition_verified = True
        self.condition_verifier = verifier
        self.condition_verified_at = timezone.now()
        self.save()
    

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
    
    @property
    def reviewer_initials(self):
        """Get reviewer initials for display."""
        if self.user.first_name and self.user.last_name:
            return f"{self.user.first_name[0]}{self.user.last_name[0]}".upper()
        return self.user.username[:2].upper()
    
    @property
    def days_since_review(self):
        """Get days since review was posted."""
        from django.utils import timezone
        delta = timezone.now() - self.created_at
        return delta.days


# Shipping Models for Dynamic Shipping Cost Calculator

class ShippingZone(models.Model):
    """Geographic shipping zones within India with different rates."""
    name = models.CharField(max_length=100, unique=True, help_text="e.g., Local (Delhi NCR), Regional (North India), National")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    # Indian geographic zones
    states = models.TextField(blank=True, help_text="Comma-separated state codes (e.g., DL,MH,GJ)")
    metro_cities = models.TextField(blank=True, help_text="Comma-separated metro city postal codes (e.g., 110001,400001)")

    # Base shipping cost for this zone
    base_cost = models.DecimalField(max_digits=8, decimal_places=2, default=0, help_text="Base shipping cost for this zone")

    # Free shipping threshold
    free_shipping_threshold = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Order value threshold for free shipping")

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ShippingMethod(models.Model):
    """Different shipping methods (Standard, Express, etc.)."""
    name = models.CharField(max_length=50, unique=True, help_text="e.g., Standard, Express, Overnight")
    description = models.TextField(blank=True)
    estimated_days = models.PositiveIntegerField(help_text="Estimated delivery days")
    is_active = models.BooleanField(default=True)

    # Cost multiplier (1.0 = base cost, 1.5 = 50% more expensive)
    cost_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.0, help_text="Cost multiplier for this method")

    # Weight and dimension limits
    max_weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Maximum weight in kg")
    max_dimensions_sum = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Max sum of L+W+H in cm")

    class Meta:
        ordering = ['estimated_days', 'name']

    def __str__(self):
        return f"{self.name} ({self.estimated_days} days)"


class ShippingRate(models.Model):
    """Detailed shipping rates based on weight and zone."""
    zone = models.ForeignKey(ShippingZone, on_delete=models.CASCADE, related_name='rates')
    method = models.ForeignKey(ShippingMethod, on_delete=models.CASCADE, related_name='rates')

    # Weight-based pricing
    min_weight_kg = models.DecimalField(max_digits=6, decimal_places=2, default=0, help_text="Minimum weight for this rate")
    max_weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Maximum weight for this rate (null = unlimited)")

    # Cost calculation
    base_cost = models.DecimalField(max_digits=8, decimal_places=2, help_text="Base cost for this weight range")
    per_kg_cost = models.DecimalField(max_digits=6, decimal_places=2, default=0, help_text="Additional cost per kg over minimum")

    # Insurance cost (percentage of item value)
    insurance_rate = models.DecimalField(max_digits=5, decimal_places=4, default=0, help_text="Insurance rate as percentage (e.g., 0.02 = 2%)")

    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['zone', 'method', 'min_weight_kg']
        unique_together = ['zone', 'method', 'min_weight_kg']

    def __str__(self):
        weight_range = f"{self.min_weight_kg}kg+"
        if self.max_weight_kg:
            weight_range = f"{self.min_weight_kg}-{self.max_weight_kg}kg"
        return f"{self.zone.name} - {self.method.name} ({weight_range})"


class ShippingCalculator(models.Model):
    """Utility model for shipping calculations."""

    @staticmethod
    def calculate_shipping_cost(order_items, shipping_address, shipping_method_id=None):
        """
        Calculate shipping cost based on order items, address, and method.

        Args:
            order_items: List of order items with product and quantity
            shipping_address: Dict with postal_code, state, country
            shipping_method_id: Optional specific shipping method

        Returns:
            Dict with shipping_cost, method, estimated_days, breakdown
        """
        from decimal import Decimal
        from apps.shipping.services import shiprocket_service

        # Try Shiprocket first
        if shiprocket_service.is_available():
            try:
                shiprocket_result = shiprocket_service.calculate_shipping_rate(
                    order_items,
                    shipping_address
                )

                # If Shiprocket returns a valid result, use it
                if 'error' not in shiprocket_result:
                    return shiprocket_result

            except Exception as e:
                # Log error but continue with fallback
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Shiprocket calculation failed, using fallback: {e}")

        # Fallback to static calculation
        return ShippingCalculator._calculate_static_shipping(order_items, shipping_address, shipping_method_id)

    @staticmethod
    def _calculate_static_shipping(order_items, shipping_address, shipping_method_id=None):
        """Fallback static shipping calculation when Shiprocket is unavailable."""
        from decimal import Decimal

        # Determine shipping zone
        zone = ShippingCalculator._get_shipping_zone(shipping_address)
        if not zone:
            return {
                'error': 'No shipping available for this location',
                'shipping_cost': 0,
                'method': None,
                'estimated_days': 0
            }

        # Calculate total weight and value
        total_weight = Decimal('0')
        total_value = Decimal('0')

        for item in order_items:
            product = item.get('product')
            quantity = item.get('quantity', 1)

            if product and hasattr(product, 'weight_grams'):
                weight_grams = product.weight_grams or 200  # Default to 200g if None
                total_weight += Decimal(str(weight_grams)) * quantity / 1000  # Convert to kg
            else:
                total_weight += Decimal('0.2') * quantity  # Default 200g per item
            total_value += Decimal(str(product.price if product else 0)) * quantity

        # Determine shipping method
        if shipping_method_id:
            try:
                method = ShippingMethod.objects.get(id=shipping_method_id, is_active=True)
            except ShippingMethod.DoesNotExist:
                return {'error': 'Invalid shipping method', 'shipping_cost': 0}
        else:
            # Auto-select cheapest method
            method = ShippingCalculator._get_cheapest_method(zone, total_weight)

        if not method:
            return {'error': 'No shipping methods available', 'shipping_cost': 0}

        # Calculate shipping cost
        rate = ShippingCalculator._get_applicable_rate(zone, method, total_weight)
        if not rate:
            return {'error': 'No shipping rates available for this weight', 'shipping_cost': 0}

        # Calculate components separately to avoid negative breakdown values
        # Base cost
        base_cost = rate.base_cost

        # Additional weight cost (before multiplier)
        weight_extra = Decimal('0')
        if total_weight > rate.min_weight_kg:
            extra_weight = Decimal(str(float(total_weight) - float(rate.min_weight_kg)))
            if extra_weight > 0:
                weight_extra = extra_weight * rate.per_kg_cost

        # Insurance cost (percentage of total value)
        insurance_cost = Decimal('0')
        if rate.insurance_rate > 0:
            insurance_cost = (total_value * rate.insurance_rate)

        # Apply method multiplier only to base + weight
        subtotal_before_multiplier = base_cost + weight_extra
        subtotal_after_multiplier = subtotal_before_multiplier * method.cost_multiplier

        # Total shipping cost before free-shipping check
        shipping_cost = subtotal_after_multiplier + insurance_cost

        # Check for free shipping
        free_shipping_applied = bool(zone.free_shipping_threshold and total_value >= zone.free_shipping_threshold)
        if free_shipping_applied:
            shipping_cost = Decimal('0')

        # Prepare breakdown ensuring non-negative components for display
        breakdown_weight_cost = (weight_extra * method.cost_multiplier) if not free_shipping_applied else Decimal('0')
        breakdown_insurance_cost = insurance_cost if not free_shipping_applied else Decimal('0')

        return {
            'shipping_cost': float(shipping_cost),
            'method': method.name,
            'estimated_days': method.estimated_days,
            'zone': zone.name,
            'breakdown': {
                'base_cost': float(base_cost if not free_shipping_applied else Decimal('0')),
                'weight_cost': float(breakdown_weight_cost),
                'insurance_cost': float(breakdown_insurance_cost),
                'method_multiplier': float(method.cost_multiplier),
                'free_shipping_applied': free_shipping_applied
            }
        }

    @staticmethod
    def _get_shipping_zone(address):
        """Determine shipping zone based on Indian address."""
        postal_code = address.get('postal_code', '')
        state = address.get('state', '')
        country = address.get('country', 'IN')

        # Only accept India
        if country != 'IN':
            return None

        # Try to find matching zone
        zones = ShippingZone.objects.filter(is_active=True)

        for zone in zones:
            # Check metro cities first (more specific)
            if zone.metro_cities and postal_code:
                metro_codes = [code.strip() for code in zone.metro_cities.split(',')]
                if postal_code in metro_codes:
                    return zone

            # Check states (case-insensitive and flexible matching)
            if zone.states and state:
                states = [s.strip().upper() for s in zone.states.split(',')]
                state_upper = state.strip().upper()
                if state_upper in states:
                    return zone

        # Return default zone if no specific match
        try:
            default_zone = zones.first()
            return default_zone
        except:
            return None

    @staticmethod
    def _get_cheapest_method(zone, weight):
        """Get the cheapest available shipping method."""
        rates = ShippingRate.objects.filter(
            zone=zone,
            is_active=True,
            min_weight_kg__lte=weight
        ).select_related('method').order_by('method__cost_multiplier', 'base_cost')

        if rates:
            return rates.first().method
        return None

    @staticmethod
    def _get_applicable_rate(zone, method, weight):
        """Get the applicable shipping rate for weight."""
        rates = ShippingRate.objects.filter(
            zone=zone,
            method=method,
            is_active=True,
            min_weight_kg__lte=weight
        )

        # Get the highest minimum weight that still applies
        rate = None
        for r in rates:
            if r.max_weight_kg is None or weight <= r.max_weight_kg:
                if rate is None or r.min_weight_kg > rate.min_weight_kg:
                    rate = r

        return rate


class ProductReservation(models.Model):
    """Product reservation/hold system."""
    product = models.ForeignKey('TShirt', on_delete=models.CASCADE, related_name='reservations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    extension_count = models.PositiveIntegerField(default=0)
    max_extensions = models.PositiveIntegerField(default=1)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['product', 'user']
    
    def __str__(self):
        return f"{self.product.title} ({self.quantity}) reserved by {self.user.username}"
    
    @property
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at
    
    @property
    def time_remaining(self):
        from django.utils import timezone
        if self.is_expired:
            return 0
        return int((self.expires_at - timezone.now()).total_seconds())
    
    def can_extend(self):
        return self.extension_count < self.max_extensions and not self.is_expired
    
    def extend_reservation(self, minutes=5):
        from django.utils import timezone
        from datetime import timedelta
        if self.can_extend():
            self.expires_at = timezone.now() + timedelta(minutes=minutes)
            self.extension_count += 1
            self.save()
            return True
        return False