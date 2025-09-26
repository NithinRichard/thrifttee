#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
django.setup()

from apps.products.models import TShirt, ShippingCalculator, ShippingZone, ShippingRate
from decimal import Decimal

# Debug the shipping calculation step by step
product = TShirt.objects.first()
print(f"Product: {product.title}, Weight: {product.weight_grams}g")

order_items = [{'product': product, 'quantity': 1}]
shipping_address = {
    'postal_code': '110001',
    'state': 'DL',
    'country': 'IN'
}

# Step 1: Check zone detection
zone = ShippingCalculator._get_shipping_zone(shipping_address)
print(f"Detected zone: {zone}")

if zone:
    # Step 2: Calculate weight
    total_weight = Decimal('0')
    for item in order_items:
        product = item.get('product')
        quantity = item.get('quantity', 1)
        if product and hasattr(product, 'weight_grams'):
            total_weight += Decimal(str(product.weight_grams or 0)) * quantity / 1000
    
    print(f"Total weight: {total_weight}kg")
    
    # Step 3: Check available rates for this zone and weight
    rates = ShippingRate.objects.filter(
        zone=zone,
        is_active=True,
        min_weight_kg__lte=total_weight
    )
    
    print(f"Available rates for weight {total_weight}kg:")
    for rate in rates:
        print(f"  - {rate.method.name}: {rate.min_weight_kg}kg - {rate.max_weight_kg}kg")
        if rate.max_weight_kg is None or total_weight <= rate.max_weight_kg:
            print(f"    [YES] This rate applies")
        else:
            print(f"    [NO] Weight exceeds max ({rate.max_weight_kg}kg)")