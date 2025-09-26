import django_filters
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta
from .models import TShirt, Brand, Category

class TShirtFilter(django_filters.FilterSet):
    """Comprehensive filter class for T-Shirt model."""
    
    # Price range filters
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    price_range = django_filters.RangeFilter(field_name="price")
    
    # Brand filters
    brand = django_filters.ModelMultipleChoiceFilter(
        queryset=Brand.objects.all(),
        field_name='brand'
    )
    
    # Category filters
    category = django_filters.ModelMultipleChoiceFilter(
        queryset=Category.objects.all(),
        field_name='category'
    )
    
    # Size filters
    size = django_filters.MultipleChoiceFilter(
        choices=TShirt.SIZE_CHOICES,
        field_name='size'
    )
    
    # Condition filters
    condition = django_filters.MultipleChoiceFilter(
        choices=TShirt.CONDITION_CHOICES,
        field_name='condition'
    )
    
    # Gender filters
    gender = django_filters.MultipleChoiceFilter(
        choices=TShirt.GENDER_CHOICES,
        field_name='gender'
    )
    
    # Availability filters
    is_available = django_filters.BooleanFilter(field_name='is_available')
    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    
    # Condition verification filters
    condition_verified = django_filters.BooleanFilter(field_name='condition_verified')
    
    # Condition detail filters
    has_stains = django_filters.BooleanFilter(field_name='has_stains')
    has_holes = django_filters.BooleanFilter(field_name='has_holes')
    has_fading = django_filters.BooleanFilter(field_name='has_fading')
    has_pilling = django_filters.BooleanFilter(field_name='has_pilling')
    has_repairs = django_filters.BooleanFilter(field_name='has_repairs')
    
    # Date filters
    created_at = django_filters.DateFromToRangeFilter(field_name='created_at')
    created_today = django_filters.BooleanFilter(method='filter_created_today')
    created_week = django_filters.BooleanFilter(method='filter_created_week')
    created_month = django_filters.BooleanFilter(method='filter_created_month')
    created_year = django_filters.BooleanFilter(method='filter_created_year')
    
    # Text filters
    color = django_filters.CharFilter(field_name='color', lookup_expr='icontains')
    material = django_filters.CharFilter(field_name='material', lookup_expr='icontains')
    
    # Discount filter
    has_discount = django_filters.BooleanFilter(method='filter_has_discount')
    
    class Meta:
        model = TShirt
        fields = {
            'price': ['exact', 'gte', 'lte'],
            'quantity': ['exact', 'gte', 'lte'],
        }
    
    def filter_has_discount(self, queryset, name, value):
        """Filter items that have a discount."""
        if value:
            return queryset.filter(original_price__gt=models.F('price'))
        return queryset.filter(original_price__isnull=True)
    
    def filter_created_today(self, queryset, name, value):
        """Filter items created today."""
        if value:
            today = timezone.now().date()
            return queryset.filter(created_at__date=today)
        return queryset
    
    def filter_created_week(self, queryset, name, value):
        """Filter items created in the past 7 days."""
        if value:
            week_ago = timezone.now() - timedelta(days=7)
            return queryset.filter(created_at__gte=week_ago)
        return queryset
    
    def filter_created_month(self, queryset, name, value):
        """Filter items created this month."""
        if value:
            now = timezone.now()
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            return queryset.filter(created_at__gte=month_start)
        return queryset
    
    def filter_created_year(self, queryset, name, value):
        """Filter items created this year."""
        if value:
            now = timezone.now()
            year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            return queryset.filter(created_at__gte=year_start)
        return queryset
