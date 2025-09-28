#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)
django.setup()

from apps.products.models import TShirt, ShippingCalculator

print('=== TESTING SHIPPING CALCULATION ===')

# Get a test product
product = TShirt.objects.filter(is_available=True).first()
if product:
    print(f"Product: {product.title}")
    print(f"Price: ₹{product.price}")

    # Test shipping calculation
    order_items = [{'product': product, 'quantity': 1}]
    shipping_address = {'country': 'IN', 'state': 'KL', 'postal_code': '695586'}

    result = ShippingCalculator.calculate_shipping_cost(order_items, shipping_address, 1)

    print("\nSHIPPING CALCULATION RESULT:")
    if 'error' in result:
        print(f"❌ Error: {result['error']}")
    else:
        print(f"✅ Shipping Cost: ₹{result['shipping_cost']}")
        print(f"Method: {result['method']}")
        print(f"Estimated Days: {result['estimated_days']}")
        print(f"Zone: {result['zone']}")

        if 'breakdown' in result:
            breakdown = result['breakdown']
            print("\n📊 Breakdown:")
            print(f"  Base Cost: ₹{breakdown['base_cost']}")
            print(f"  Weight Cost: ₹{breakdown['weight_cost']}")
            print(f"  Insurance Cost: ₹{breakdown['insurance_cost']}")
            print(f"  Method Multiplier: {breakdown['method_multiplier']}")
            print(f"  Free Shipping Applied: {breakdown['free_shipping_applied']}")
else:
    print("❌ No available products found")

print("\n✅ Test completed!")
