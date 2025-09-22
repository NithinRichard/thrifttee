from django.urls import path
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
