from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.permissions import AllowAny
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
    path('verify_payment/', views.OrderViewSet.as_view({'post': 'verify_payment'}, permission_classes=[AllowAny]), name='verify-payment'),
    path('webhook/razorpay/', views.LegacyOrderViews.razorpay_webhook, name='razorpay-webhook'),
    # Guest checkout endpoints (unauthenticated)
    path('create_guest_order/', views.create_guest_order, name='create-guest-order'),
    path('create_guest_payment/', views.create_guest_payment, name='create-guest-payment'),
    # Return request endpoint
    path('return-request/', views.create_return_request, name='return-request'),
]

urlpatterns = [
    # Legacy and guest endpoints first to avoid router capturing as a detail pk
    *legacy_patterns,

    # Include router URLs for main CRUD operations
    path('', include(router.urls)),
]