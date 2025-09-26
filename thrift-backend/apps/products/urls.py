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
    path('products/<int:product_id>/reviews/', views.product_reviews, name='product-reviews'),
    path('products/<int:product_id>/reviews/submit/', views.submit_review, name='submit-review'),
    
    # Utility endpoints
    path('search/suggestions/', views.search_suggestions, name='search-suggestions'),
    path('filters/', views.filter_options, name='filter-options'),
    
    # Shipping Calculator endpoints
    path('shipping/calculate/', views.calculate_shipping, name='calculate-shipping'),
    path('shipping/zones/', views.shipping_zones, name='shipping-zones'),
    path('shipping/methods/', views.shipping_methods, name='shipping-methods'),
    path('shipping/rates/', views.shipping_rates, name='shipping-rates'),
    
    # Reservation endpoints
    path('<int:product_id>/reserve/', views.create_reservation, name='create-reservation'),
    path('reservations/<int:reservation_id>/extend/', views.extend_reservation, name='extend-reservation'),
    path('<int:product_id>/reservation-status/', views.check_reservation_status, name='check-reservation-status'),
]
