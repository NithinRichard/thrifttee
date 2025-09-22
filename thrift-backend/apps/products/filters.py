import django_filters
from .models import TShirt, Brand, Category

class TShirtFilter(django_filters.FilterSet):
    """Filter class for T-Shirt model."""
    
    # Price range filters
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    price_range = django_filters.RangeFilter(field_name="price")
    
    # Multiple choice filters
    brand = django_filters.ModelMultipleChoiceFilter(
        queryset=Brand.objects.all(),
        field_name='brand',
        to_field_name='slug'
    )
    
    category = django_filters.ModelMultipleChoiceFilter(
        queryset=Category.objects.all(),
        field_name='category',
        to_field_name='slug'
    )
    
    size = django_filters.MultipleChoiceFilter(
        choices=TShirt.SIZE_CHOICES,
        field_name='size'
    )
    
    condition = django_filters.MultipleChoiceFilter(
        choices=TShirt.CONDITION_CHOICES,
        field_name='condition'
    )
    
    gender = django_filters.MultipleChoiceFilter(
        choices=TShirt.GENDER_CHOICES,
        field_name='gender'
    )
    
    # Text filters
    color = django_filters.CharFilter(field_name='color', lookup_expr='icontains')
    material = django_filters.CharFilter(field_name='material', lookup_expr='icontains')
    
    # Boolean filters
    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    has_discount = django_filters.BooleanFilter(method='filter_has_discount')
    
    class Meta:
        model = TShirt
        fields = {
            'price': ['exact', 'gte', 'lte'],
            'created_at': ['gte', 'lte'],
        }
    
    def filter_has_discount(self, queryset, name, value):
        """Filter items that have a discount (original_price > price)."""
        if value:
            return queryset.filter(original_price__gt=models.F('price'))
        return queryset.filter(original_price__isnull=True)
