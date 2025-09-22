from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Min, Max
from django.db import models
from .models import TShirt, Brand, Category, TShirtReview
from .serializers import (
    TShirtListSerializer, TShirtDetailSerializer, BrandSerializer,
    CategorySerializer, TShirtReviewSerializer
)
from .filters import TShirtFilter

class TShirtListView(generics.ListAPIView):
    """List view for T-Shirts with filtering and search."""
    queryset = TShirt.objects.filter(is_available=True).select_related('brand', 'category')
    serializer_class = TShirtListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TShirtFilter
    search_fields = ['title', 'description', 'brand__name', 'color', 'tags']
    ordering_fields = ['price', 'created_at', 'title']
    ordering = ['-created_at']

class TShirtDetailView(generics.RetrieveAPIView):
    """Detail view for individual T-Shirt."""
    queryset = TShirt.objects.filter(is_available=True).select_related('brand', 'category')
    serializer_class = TShirtDetailSerializer
    lookup_field = 'slug'

class FeaturedTShirtsView(generics.ListAPIView):
    """List view for featured T-Shirts."""
    queryset = TShirt.objects.filter(is_available=True, is_featured=True).select_related('brand', 'category')
    serializer_class = TShirtListSerializer

class BrandListView(generics.ListAPIView):
    """List view for all brands."""
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

class CategoryListView(generics.ListAPIView):
    """List view for all categories."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class TShirtReviewListCreateView(generics.ListCreateAPIView):
    """List and create reviews for a specific T-Shirt."""
    serializer_class = TShirtReviewSerializer
    
    def get_queryset(self):
        tshirt_id = self.kwargs['tshirt_id']
        return TShirtReview.objects.filter(tshirt_id=tshirt_id).select_related('user')
    
    def perform_create(self, serializer):
        tshirt_id = self.kwargs['tshirt_id']
        serializer.save(tshirt_id=tshirt_id)

@api_view(['GET'])
def search_suggestions(request):
    """API endpoint for search suggestions."""
    query = request.GET.get('q', '').strip()
    
    if len(query) < 2:
        return Response({'suggestions': []})
    
    # Search in brands, colors, and tags
    brands = Brand.objects.filter(name__icontains=query)[:5]
    colors = TShirt.objects.filter(color__icontains=query).values_list('color', flat=True).distinct()[:5]
    
    suggestions = []
    
    # Add brand suggestions
    for brand in brands:
        suggestions.append({
            'type': 'brand',
            'value': brand.name,
            'label': f"Brand: {brand.name}"
        })
    
    # Add color suggestions
    for color in colors:
        suggestions.append({
            'type': 'color',
            'value': color,
            'label': f"Color: {color.title()}"
        })
    
    return Response({'suggestions': suggestions[:10]})

@api_view(['GET'])
def filter_options(request):
    """API endpoint to get all available filter options."""
    brands = Brand.objects.all().values('id', 'name')
    categories = Category.objects.all().values('id', 'name')
    sizes = TShirt.objects.values_list('size', flat=True).distinct()
    colors = TShirt.objects.values_list('color', flat=True).distinct()
    conditions = TShirt.objects.values_list('condition', flat=True).distinct()
    
    # Get price range
    price_range = TShirt.objects.filter(is_available=True).aggregate(
        min_price=models.Min('price'),
        max_price=models.Max('price')
    )
    
    return Response({
        'brands': list(brands),
        'categories': list(categories),
        'sizes': [{'value': size, 'label': size.upper()} for size in sizes],
        'colors': [{'value': color, 'label': color.title()} for color in colors],
        'conditions': [{'value': condition, 'label': condition.replace('_', ' ').title()} for condition in conditions],
        'price_range': price_range
    })
