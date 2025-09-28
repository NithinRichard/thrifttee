"""
Shipping URLs
"""

from django.urls import path
from apps.shipping.views import (
    create_shiprocket_order,
    track_shiprocket_order,
    calculate_shiprocket_shipping,
    shiprocket_webhook
)

urlpatterns = [
    path('orders/<int:order_id>/shiprocket/create/', create_shiprocket_order, name='create_shiprocket_order'),
    path('orders/<int:order_id>/shiprocket/track/', track_shiprocket_order, name='track_shiprocket_order'),
    path('calculate/', calculate_shiprocket_shipping, name='calculate_shiprocket_shipping'),
    path('webhook/', shiprocket_webhook, name='shiprocket_webhook'),
]
