#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
django.setup()

from apps.products.models import TShirt, ShippingCalculator

# Test shipping calculation
product = TShirt.objects.first()
print(f"Testing with product: {product.title}, Weight: {product.weight_grams}g")

order_items = [{'product': product, 'quantity': 1}]
shipping_address = {
    'postal_code': '110001',
    'state': 'DL',
    'country': 'IN'
}

result = ShippingCalculator.calculate_shipping_cost(order_items, shipping_address)
print("Shipping calculation result:")
print(result)