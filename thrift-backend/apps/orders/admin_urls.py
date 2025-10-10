from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .admin_views import AdminOrderViewSet, AdminProductViewSet, AdminReturnViewSet

router = DefaultRouter()
router.register(r'orders', AdminOrderViewSet, basename='admin-orders')
router.register(r'products', AdminProductViewSet, basename='admin-products')
router.register(r'returns', AdminReturnViewSet, basename='admin-returns')

urlpatterns = [
    path('', include(router.urls)),
]
