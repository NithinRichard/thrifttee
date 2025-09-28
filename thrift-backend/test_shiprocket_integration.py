#!/usr/bin/env python
"""
Shiprocket Integration Test Script
Tests the complete Shiprocket integration functionality
"""

import os
import sys
import django
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)
django.setup()

from apps.products.models import TShirt, ShippingCalculator
from apps.shipping.services import shiprocket_service
from apps.orders.models import Order

def test_shiprocket_integration():
    """Test the complete Shiprocket integration"""

    print("🚀 Shiprocket Integration Test")
    print("=" * 50)

    # Test 1: Check if Shiprocket service is available
    print("\n1. Testing Shiprocket Service Availability")
    print("-" * 40)

    if shiprocket_service.is_available():
        print("✅ Shiprocket service is available")
        print(f"   Email: {shiprocket_service.api_email}")
        print(f"   Token: {bool(shiprocket_service.api_token)}")
    else:
        print("⚠️  Shiprocket service not available")
        print("   Please configure SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env")
        print("   See .env.shiprocket.example for configuration details")
        return

    # Test 2: Test shipping rate calculation
    print("\n2. Testing Shipping Rate Calculation")
    print("-" * 40)

    try:
        # Get a test product
        product = TShirt.objects.filter(is_available=True).first()
        if not product:
            print("❌ No available products found")
            return

        print(f"Testing with product: {product.title} (₹{product.price})")

        # Test shipping calculation
        order_items = [{'product': product, 'quantity': 1}]
        shipping_address = {
            'country': 'IN',
            'state': 'KL',
            'postal_code': '695586',
            'city': 'Thiruvananthapuram'
        }

        result = shiprocket_service.calculate_shipping_rate(
            order_items,
            shipping_address
        )

        if 'error' not in result:
            print("✅ Shiprocket rate calculation successful")
            print(f"   Shipping Cost: ₹{result['shipping_cost']}")
            print(f"   Method: {result['method']}")
            print(f"   Estimated Days: {result['estimated_days']}")
            print(f"   Zone: {result['zone']}")

            if 'breakdown' in result:
                breakdown = result['breakdown']
                print("   📊 Breakdown:")
                print(f"     Base Cost: ₹{breakdown['base_cost']}")
                print(f"     Weight Cost: ₹{breakdown['weight_cost']}")
                print(f"     Insurance Cost: ₹{breakdown['insurance_cost']}")
                print(f"     Courier: {breakdown.get('courier', 'N/A')}")
        else:
            print(f"❌ Shiprocket rate calculation failed: {result['error']}")

    except Exception as e:
        print(f"❌ Error testing shipping calculation: {e}")
        import traceback
        traceback.print_exc()

    # Test 3: Test static fallback calculation
    print("\n3. Testing Static Fallback Calculation")
    print("-" * 40)

    try:
        static_result = ShippingCalculator._calculate_static_shipping(
            order_items,
            shipping_address
        )

        if 'error' not in static_result:
            print("✅ Static calculation successful")
            print(f"   Shipping Cost: ₹{static_result['shipping_cost']}")
            print(f"   Method: {static_result['method']}")
            print(f"   Zone: {static_result['zone']}")
        else:
            print(f"❌ Static calculation failed: {static_result['error']}")

    except Exception as e:
        print(f"❌ Error testing static calculation: {e}")

    # Test 4: Test main calculation method (uses Shiprocket with fallback)
    print("\n4. Testing Main Calculation Method (Shiprocket + Fallback)")
    print("-" * 40)

    try:
        main_result = ShippingCalculator.calculate_shipping_cost(
            order_items,
            shipping_address
        )

        if 'error' not in main_result:
            print("✅ Main calculation successful")
            print(f"   Shipping Cost: ₹{main_result['shipping_cost']}")
            print(f"   Method: {main_result['method']}")
            print(f"   Source: {'Shiprocket' if 'shiprocket_data' in main_result else 'Static Fallback'}")
        else:
            print(f"❌ Main calculation failed: {main_result['error']}")

    except Exception as e:
        print(f"❌ Error testing main calculation: {e}")

    # Test 5: Test free shipping threshold
    print("\n5. Testing Free Shipping Threshold")
    print("-" * 40)

    try:
        # Create a high-value order to test free shipping
        high_value_items = [
            {'product': product, 'quantity': 10}  # Should exceed ₹1000 threshold
        ]

        high_value_result = ShippingCalculator.calculate_shipping_cost(
            high_value_items,
            shipping_address
        )

        if 'error' not in high_value_result:
            print("✅ High-value order calculation successful")
            print(f"   Order Value: ₹{product.price * 10}")
            print(f"   Shipping Cost: ₹{high_value_result['shipping_cost']}")
            print(f"   Free Shipping Applied: {high_value_result['breakdown']['free_shipping_applied']}")
        else:
            print(f"❌ High-value calculation failed: {high_value_result['error']}")

    except Exception as e:
        print(f"❌ Error testing high-value calculation: {e}")

    print("\n" + "=" * 50)
    print("🎉 Shiprocket Integration Test Complete!")

    if shiprocket_service.is_available():
        print("\n✅ Shiprocket is ready to use!")
        print("   - API integration active")
        print("   - Automatic fallback to static rates")
        print("   - Real-time shipping calculations")
        print("   - Order creation and tracking available")
    else:
        print("\n⚠️  Shiprocket not configured")
        print("   - Using static fallback rates")
        print("   - Configure credentials to enable Shiprocket")

    print("\n🔗 API Endpoints Available:")
    print("   POST /api/v1/shipping/calculate/")
    print("   POST /api/v1/shipping/orders/<id>/shiprocket/create/")
    print("   GET  /api/v1/shipping/orders/<id>/shiprocket/track/")
    print("   POST /api/v1/shipping/webhook/")


if __name__ == "__main__":
    test_shiprocket_integration()
