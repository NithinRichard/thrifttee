from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'orders'

# Create router for ViewSet
router = DefaultRouter()
router.register(r'', views.OrderViewSet, basename='orders')

# Legacy function-based views for backward compatibility
legacy_patterns = [
    path('payment/create-intent/', views.LegacyOrderViews.create_payment_intent, name='create-payment-intent'),
    path('payment/confirm/', views.LegacyOrderViews.confirm_payment, name='confirm-payment'),
    path('create-from-cart/', views.OrderViewSet.as_view({'post': 'create_from_cart'}), name='create-from-cart'),
]

urlpatterns = [
    # Include router URLs for main CRUD operations
    path('', include(router.urls)),

    # Legacy endpoints for backward compatibility
    *legacy_patterns,
]