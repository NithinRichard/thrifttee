#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
django.setup()

from apps.products.models import TShirt, ShippingCalculator, ShippingZone, ShippingRate, ShippingMethod
from decimal import Decimal

# Test the exact _get_applicable_rate method
product = TShirt.objects.first()
order_items = [{'product': product, 'quantity': 1}]
shipping_address = {'postal_code': '110001', 'state': 'DL', 'country': 'IN'}

zone = ShippingCalculator._get_shipping_zone(shipping_address)
total_weight = Decimal('0.2')  # 200g = 0.2kg

print(f"Zone: {zone}")
print(f"Weight: {total_weight}kg")

# Test getting cheapest method
method = ShippingCalculator._get_cheapest_method(zone, total_weight)
print(f"Cheapest method: {method}")

if method:
    # Test getting applicable rate
    rate = ShippingCalculator._get_applicable_rate(zone, method, total_weight)
    print(f"Applicable rate: {rate}")
    
    if rate:
        print(f"Rate details: {rate.min_weight_kg}kg - {rate.max_weight_kg}kg, Cost: {rate.base_cost}")
    else:
        print("No applicable rate found!")
        
        # Debug: show all rates for this zone and method
        all_rates = ShippingRate.objects.filter(zone=zone, method=method, is_active=True)
        print("All rates for this zone/method:")
        for r in all_rates:
            print(f"  - {r.min_weight_kg}kg - {r.max_weight_kg}kg")
            print(f"    min_weight_kg <= weight: {r.min_weight_kg} <= {total_weight} = {r.min_weight_kg <= total_weight}")
            if r.max_weight_kg:
                print(f"    weight <= max_weight_kg: {total_weight} <= {r.max_weight_kg} = {total_weight <= r.max_weight_kg}")
            else:
                print(f"    max_weight_kg is None (unlimited)")