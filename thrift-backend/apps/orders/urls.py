from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSet
router = DefaultRouter()
router.register(r'', views.OrderViewSet, basename='orders')

# Legacy function-based views for backward compatibility
legacy_patterns = [
    path('payment/create-intent/', views.LegacyOrderViews.create_payment_intent, name='create-payment-intent'),
    path('payment/confirm/', views.LegacyOrderViews.confirm_payment, name='confirm-payment'),
    path('create_razorpay_order/', views.OrderViewSet.as_view({'post': 'create_razorpay_order'}), name='create-razorpay-order'),
    path('create-from-cart/', views.OrderViewSet.as_view({'post': 'create_from_cart'}), name='create-from-cart'),
    path('verify_payment/', views.OrderViewSet.as_view({'post': 'verify_payment'}), name='verify-payment'),
    path('webhook/razorpay/', views.LegacyOrderViews.razorpay_webhook, name='razorpay-webhook'),
]

urlpatterns = [
    # Include router URLs for main CRUD operations
    path('', include(router.urls)),

    # Legacy endpoints for backward compatibility
    *legacy_patterns,
]