#!/usr/bin/env python3
"""
Django Starter Files Generator
Creates essential Django files for the thrift t-shirt shop backend.
"""

import os

def create_django_starter_files():
    """Create essential Django starter files."""
    
    # Create apps directory structure first
    apps_dirs = [
        'thrift-backend/apps/products',
        'thrift-backend/apps/users', 
        'thrift-backend/apps/orders',
        'thrift-backend/apps/cart',
        'thrift-backend/apps/common',
        'thrift-backend/thrift_shop',
    ]
    
    for directory in apps_dirs:
        os.makedirs(directory, exist_ok=True)
    
    # Products App - Models
    products_models = '''from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from PIL import Image
import os

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
    
    def save(self, *args, **kwargs):
        """Override save to handle image optimization."""
        super().save(*args, **kwargs)
        
        # Optimize primary image
        if self.primary_image:
            self.optimize_image(self.primary_image.path)
    
    def optimize_image(self, image_path, max_size=(800, 800), quality=85):
        """Optimize uploaded images."""
        try:
            with Image.open(image_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if too large
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # Save with optimization
                img.save(image_path, 'JPEG', quality=quality, optimize=True)
        except Exception as e:
            print(f"Error optimizing image {image_path}: {e}")

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
'''
    
    with open('thrift-backend/apps/products/models.py', 'w') as f:
        f.write(products_models)
    
    # Products App - Serializers
    products_serializers = '''from rest_framework import serializers
from .models import TShirt, Brand, Category, TShirtReview

class BrandSerializer(serializers.ModelSerializer):
    """Serializer for Brand model."""
    
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'description']

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']

class TShirtListSerializer(serializers.ModelSerializer):
    """Serializer for T-Shirt list view (minimal data)."""
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = TShirt
        fields = [
            'id', 'title', 'slug', 'brand', 'category', 'size', 'color',
            'condition', 'price', 'original_price', 'discount_percentage',
            'primary_image', 'is_featured', 'created_at'
        ]

class TShirtDetailSerializer(serializers.ModelSerializer):
    """Serializer for T-Shirt detail view (full data)."""
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    all_images = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()
    reviews_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = TShirt
        fields = [
            'id', 'title', 'slug', 'description', 'brand', 'category',
            'size', 'color', 'material', 'gender', 'condition', 'price',
            'original_price', 'discount_percentage', 'quantity', 'is_available',
            'is_featured', 'meta_description', 'tags', 'all_images',
            'reviews_count', 'average_rating', 'created_at', 'updated_at'
        ]
    
    def get_reviews_count(self, obj):
        return obj.reviews.count()
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return round(sum(review.rating for review in reviews) / len(reviews), 1)
        return 0

class TShirtReviewSerializer(serializers.ModelSerializer):
    """Serializer for T-Shirt reviews."""
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = TShirtReview
        fields = [
            'id', 'user', 'rating', 'title', 'comment',
            'is_verified_purchase', 'created_at'
        ]
        read_only_fields = ['user', 'is_verified_purchase']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
'''
    
    with open('thrift-backend/apps/products/serializers.py', 'w') as f:
        f.write(products_serializers)
    
    # Products App - Views
    products_views = '''from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
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
'''
    
    with open('thrift-backend/apps/products/views.py', 'w') as f:
        f.write(products_views)
    
    # Products App - Filters
    products_filters = '''import django_filters
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
'''
    
    with open('thrift-backend/apps/products/filters.py', 'w') as f:
        f.write(products_filters)
    
    # Products App - URLs
    products_urls = '''from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    # T-Shirt endpoints
    path('tshirts/', views.TShirtListView.as_view(), name='tshirt-list'),
    path('tshirts/<slug:slug>/', views.TShirtDetailView.as_view(), name='tshirt-detail'),
    path('tshirts/featured/', views.FeaturedTShirtsView.as_view(), name='featured-tshirts'),
    
    # Brand and Category endpoints
    path('brands/', views.BrandListView.as_view(), name='brand-list'),
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
    # Review endpoints
    path('tshirts/<int:tshirt_id>/reviews/', views.TShirtReviewListCreateView.as_view(), name='tshirt-reviews'),
    
    # Utility endpoints
    path('search/suggestions/', views.search_suggestions, name='search-suggestions'),
    path('filters/', views.filter_options, name='filter-options'),
]
'''
    
    with open('thrift-backend/apps/products/urls.py', 'w') as f:
        f.write(products_urls)
    
    # Products App - Admin
    products_admin = '''from django.contrib import admin
from django.utils.html import format_html
from .models import Brand, Category, TShirt, TShirtReview

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'tshirt_count', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']
    
    def tshirt_count(self, obj):
        return obj.tshirts.count()
    tshirt_count.short_description = 'T-Shirts'

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'tshirt_count', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']
    
    def tshirt_count(self, obj):
        return obj.tshirts.count()
    tshirt_count.short_description = 'T-Shirts'

@admin.register(TShirt)
class TShirtAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'brand', 'size', 'color', 'condition', 'price',
        'is_available', 'is_featured', 'image_preview', 'created_at'
    ]
    list_filter = [
        'brand', 'size', 'condition', 'gender', 'is_available',
        'is_featured', 'created_at'
    ]
    search_fields = ['title', 'description', 'brand__name', 'color', 'tags']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at', 'image_preview']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'brand', 'category')
        }),
        ('Physical Attributes', {
            'fields': ('size', 'color', 'material', 'gender')
        }),
        ('Condition & Pricing', {
            'fields': ('condition', 'price', 'original_price', 'quantity')
        }),
        ('Availability', {
            'fields': ('is_available', 'is_featured')
        }),
        ('Images', {
            'fields': ('primary_image', 'image_2', 'image_3', 'image_4', 'image_preview')
        }),
        ('SEO & Marketing', {
            'fields': ('meta_description', 'tags'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.primary_image:
            return format_html(
                '<img src="{}" style="width: 100px; height: 100px; object-fit: cover;" />',
                obj.primary_image.url
            )
        return "No image"
    image_preview.short_description = 'Preview'

@admin.register(TShirtReview)
class TShirtReviewAdmin(admin.ModelAdmin):
    list_display = ['tshirt', 'user', 'rating', 'title', 'is_verified_purchase', 'created_at']
    list_filter = ['rating', 'is_verified_purchase', 'created_at']
    search_fields = ['tshirt__title', 'user__username', 'title', 'comment']
    readonly_fields = ['created_at', 'updated_at']
'''
    
    with open('thrift-backend/apps/products/admin.py', 'w') as f:
        f.write(products_admin)
    
    # Create __init__.py files
    init_files = [
        'thrift-backend/apps/__init__.py',
        'thrift-backend/apps/products/__init__.py',
        'thrift-backend/apps/users/__init__.py',
        'thrift-backend/apps/orders/__init__.py',
        'thrift-backend/apps/cart/__init__.py',
        'thrift-backend/apps/common/__init__.py',
        'thrift-backend/thrift_shop/__init__.py',
    ]
    
    for init_file in init_files:
        with open(init_file, 'w') as f:
            f.write('')
    
    # Main Django URLs
    main_urls = '''from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/products/', include('apps.products.urls')),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/cart/', include('apps.cart.urls')),
    path('api/v1/orders/', include('apps.orders.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
'''
    
    with open('thrift-backend/thrift_shop/urls.py', 'w') as f:
        f.write(main_urls)
    
    print("✅ Django starter files created successfully!")
    print("📁 Created files:")
    print("   - Products app: models, serializers, views, filters, urls, admin")
    print("   - Main URL configuration")
    print("   - App structure with __init__.py files")

def create_react_starter_files():
    """Create essential React starter files."""
    
    # API Service
    api_service = '''import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class ApiService {
  // Products
  async getProducts(params = {}) {
    const response = await api.get('/products/tshirts/', { params });
    return response.data;
  }

  async getProduct(slug) {
    const response = await api.get(`/products/tshirts/${slug}/`);
    return response.data;
  }

  async getFeaturedProducts() {
    const response = await api.get('/products/tshirts/featured/');
    return response.data;
  }

  async searchProducts(query) {
    const response = await api.get('/products/tshirts/', {
      params: { search: query }
    });
    return response.data;
  }

  async getSearchSuggestions(query) {
    const response = await api.get('/products/search/suggestions/', {
      params: { q: query }
    });
    return response.data;
  }

  async getFilterOptions() {
    const response = await api.get('/products/filters/');
    return response.data;
  }

  // Brands and Categories
  async getBrands() {
    const response = await api.get('/products/brands/');
    return response.data;
  }

  async getCategories() {
    const response = await api.get('/products/categories/');
    return response.data;
  }

  // Cart
  async getCart() {
    const response = await api.get('/cart/');
    return response.data;
  }

  async addToCart(productId, quantity = 1) {
    const response = await api.post('/cart/add/', {
      product_id: productId,
      quantity
    });
    return response.data;
  }

  async updateCartItem(itemId, quantity) {
    const response = await api.put(`/cart/update/${itemId}/`, {
      quantity
    });
    return response.data;
  }

  async removeFromCart(itemId) {
    const response = await api.delete(`/cart/remove/${itemId}/`);
    return response.data;
  }

  // Orders
  async createOrder(orderData) {
    const response = await api.post('/orders/', orderData);
    return response.data;
  }

  async getOrders() {
    const response = await api.get('/orders/');
    return response.data;
  }

  async getOrder(orderId) {
    const response = await api.get(`/orders/${orderId}/`);
    return response.data;
  }

  // Authentication
  async login(credentials) {
    const response = await api.post('/users/login/', credentials);
    return response.data;
  }

  async register(userData) {
    const response = await api.post('/users/register/', userData);
    return response.data;
  }

  async logout() {
    const response = await api.post('/users/logout/');
    return response.data;
  }

  async getProfile() {
    const response = await api.get('/users/profile/');
    return response.data;
  }

  async updateProfile(profileData) {
    const response = await api.put('/users/profile/', profileData);
    return response.data;
  }
}

export default new ApiService();
'''
    
    with open('thrift-frontend/src/services/api.js', 'w') as f:
        f.write(api_service)
    
    # App Context
    app_context = '''import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

// Initial state
const initialState = {
  // Products
  products: [],
  featuredProducts: [],
  currentProduct: null,
  brands: [],
  categories: [],
  filterOptions: {},
  
  // Cart
  cart: [],
  cartCount: 0,
  cartTotal: 0,
  
  // User
  user: null,
  isAuthenticated: false,
  
  // UI
  loading: false,
  error: null,
  searchQuery: '',
  filters: {},
};

// Action types
export const actionTypes = {
  // Loading and errors
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Products
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_FEATURED_PRODUCTS: 'SET_FEATURED_PRODUCTS',
  SET_CURRENT_PRODUCT: 'SET_CURRENT_PRODUCT',
  SET_BRANDS: 'SET_BRANDS',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_FILTER_OPTIONS: 'SET_FILTER_OPTIONS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  
  // Cart
  SET_CART: 'SET_CART',
  ADD_TO_CART: 'ADD_TO_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  
  // User
  SET_USER: 'SET_USER',
  LOGOUT_USER: 'LOGOUT_USER',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case actionTypes.SET_PRODUCTS:
      return { ...state, products: action.payload };
    
    case actionTypes.SET_FEATURED_PRODUCTS:
      return { ...state, featuredProducts: action.payload };
    
    case actionTypes.SET_CURRENT_PRODUCT:
      return { ...state, currentProduct: action.payload };
    
    case actionTypes.SET_BRANDS:
      return { ...state, brands: action.payload };
    
    case actionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload };
    
    case actionTypes.SET_FILTER_OPTIONS:
      return { ...state, filterOptions: action.payload };
    
    case actionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    
    case actionTypes.SET_FILTERS:
      return { ...state, filters: action.payload };
    
    case actionTypes.SET_CART:
      const cart = action.payload;
      const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
      const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      return { ...state, cart, cartCount, cartTotal };
    
    case actionTypes.ADD_TO_CART:
      const newItem = action.payload;
      const existingItemIndex = state.cart.findIndex(item => item.id === newItem.id);
      
      let updatedCart;
      if (existingItemIndex >= 0) {
        updatedCart = state.cart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        updatedCart = [...state.cart, newItem];
      }
      
      const newCartCount = updatedCart.reduce((total, item) => total + item.quantity, 0);
      const newCartTotal = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      return {
        ...state,
        cart: updatedCart,
        cartCount: newCartCount,
        cartTotal: newCartTotal
      };
    
    case actionTypes.UPDATE_CART_ITEM:
      const { itemId, quantity } = action.payload;
      const updatedCartItems = state.cart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      
      const updatedCartCount = updatedCartItems.reduce((total, item) => total + item.quantity, 0);
      const updatedCartTotal = updatedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      return {
        ...state,
        cart: updatedCartItems,
        cartCount: updatedCartCount,
        cartTotal: updatedCartTotal
      };
    
    case actionTypes.REMOVE_FROM_CART:
      const filteredCart = state.cart.filter(item => item.id !== action.payload);
      const filteredCartCount = filteredCart.reduce((total, item) => total + item.quantity, 0);
      const filteredCartTotal = filteredCart.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      return {
        ...state,
        cart: filteredCart,
        cartCount: filteredCartCount,
        cartTotal: filteredCartTotal
      };
    
    case actionTypes.CLEAR_CART:
      return { ...state, cart: [], cartCount: 0, cartTotal: 0 };
    
    case actionTypes.SET_USER:
      return { ...state, user: action.payload, isAuthenticated: true };
    
    case actionTypes.LOGOUT_USER:
      return { ...state, user: null, isAuthenticated: false, cart: [], cartCount: 0, cartTotal: 0 };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      // Load filter options
      const filterOptions = await apiService.getFilterOptions();
      dispatch({ type: actionTypes.SET_FILTER_OPTIONS, payload: filterOptions });
      
      // Load brands and categories
      const [brands, categories] = await Promise.all([
        apiService.getBrands(),
        apiService.getCategories()
      ]);
      
      dispatch({ type: actionTypes.SET_BRANDS, payload: brands });
      dispatch({ type: actionTypes.SET_CATEGORIES, payload: categories });
      
      // Check for existing auth token
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const user = await apiService.getProfile();
          dispatch({ type: actionTypes.SET_USER, payload: user });
          
          // Load user's cart
          const cart = await apiService.getCart();
          dispatch({ type: actionTypes.SET_CART, payload: cart });
        } catch (error) {
          // Token might be invalid
          localStorage.removeItem('authToken');
        }
      }
      
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  // Action creators
  const actions = {
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: actionTypes.CLEAR_ERROR }),
    
    setProducts: (products) => dispatch({ type: actionTypes.SET_PRODUCTS, payload: products }),
    setFeaturedProducts: (products) => dispatch({ type: actionTypes.SET_FEATURED_PRODUCTS, payload: products }),
    setCurrentProduct: (product) => dispatch({ type: actionTypes.SET_CURRENT_PRODUCT, payload: product }),
    setSearchQuery: (query) => dispatch({ type: actionTypes.SET_SEARCH_QUERY, payload: query }),
    setFilters: (filters) => dispatch({ type: actionTypes.SET_FILTERS, payload: filters }),
    
    addToCart: (item) => dispatch({ type: actionTypes.ADD_TO_CART, payload: item }),
    updateCartItem: (itemId, quantity) => dispatch({ type: actionTypes.UPDATE_CART_ITEM, payload: { itemId, quantity } }),
    removeFromCart: (itemId) => dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: itemId }),
    clearCart: () => dispatch({ type: actionTypes.CLEAR_CART }),
    
    setUser: (user) => dispatch({ type: actionTypes.SET_USER, payload: user }),
    logoutUser: () => {
      localStorage.removeItem('authToken');
      dispatch({ type: actionTypes.LOGOUT_USER });
    },
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
'''
    
    with open('thrift-frontend/src/contexts/AppContext.js', 'w') as f:
        f.write(app_context)
    
    print("✅ React starter files created successfully!")
    print("📁 Created files:")
    print("   - API service with all endpoints")
    print("   - App context with state management")

def main():
    """Main function to create all starter files."""
    print("🚀 Creating Django and React starter files...")
    print("=" * 60)
    
    try:
        create_django_starter_files()
        print()
        create_react_starter_files()
        
        print("\n" + "=" * 60)
        print("✅ All starter files created successfully!")
        print("\n📋 Next Steps:")
        print("1. Run the main setup script: python setup_project.py")
        print("2. Set up your Django backend:")
        print("   cd thrift-backend")
        print("   python -m venv venv")
        print("   source venv/bin/activate  # On Windows: venv\\Scripts\\activate")
        print("   pip install -r requirements.txt")
        print("   python manage.py makemigrations")
        print("   python manage.py migrate")
        print("   python manage.py createsuperuser")
        print("3. Set up your React frontend:")
        print("   cd thrift-frontend")
        print("   npm install")
        print("   npm install -D tailwindcss postcss autoprefixer")
        print("   npx tailwindcss init -p")
        
    except Exception as e:
        print(f"❌ Error creating starter files: {str(e)}")

if __name__ == "__main__":
    main()