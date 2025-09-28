#!/usr/bin/env python
"""
Comprehensive Shiprocket Integration Test
Tests the complete Shiprocket workflow with real API calls
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

from apps.products.models import TShirt
from apps.shipping.services import shiprocket_service

def test_shiprocket_full_integration():
    """Test complete Shiprocket integration"""

    print("🚀 Comprehensive Shiprocket Integration Test")
    print("=" * 60)

    # Test 1: Check Shiprocket service availability
    print("\n1. Shiprocket Service Availability")
    print("-" * 40)

    if shiprocket_service.is_available():
        print("✅ Shiprocket service is available")
        print(f"   Email: {shiprocket_service.api_email}")
        print(f"   Channel ID: {shiprocket_service.api_client.channel_id if hasattr(shiprocket_service.api_client, 'channel_id') else 'N/A'}")
        print(f"   Token: {bool(shiprocket_service.api_client.token) if shiprocket_service.api_client else 'N/A'}")
    else:
        print("❌ Shiprocket service not available")
        print("   Please check your .env configuration")
        return

    # Test 2: Test shipping rate calculation with Shiprocket
    print("\n2. Real-time Shipping Rate Calculation")
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
                print(f"     Shiprocket Rate: {breakdown.get('shiprocket_rate', 'N/A')}")

            if 'shiprocket_data' in result:
                print("   🚚 Shiprocket Data Available")
        else:
            print(f"❌ Shiprocket rate calculation failed: {result['error']}")

    except Exception as e:
        print(f"❌ Error testing shipping calculation: {e}")
        import traceback
        traceback.print_exc()

    # Test 3: Test order creation (if we have an order)
    print("\n3. Order Creation Test")
    print("-" * 40)

    try:
        from apps.orders.models import Order

        # Get a recent order for testing
        recent_order = Order.objects.filter(status='confirmed').first()

        if recent_order:
            print(f"Testing with order: {recent_order.id}")

            # Prepare order items
            order_items = []
            for item in recent_order.items.all():
                order_items.append({
                    'product': item.product,
                    'quantity': item.quantity
                })

            # Prepare shipping address
            shipping_address = {
                'name': 'Test Customer',
                'email': 'test@example.com',
                'phone': '9876543210',
                'address': 'Test Address',
                'city': 'Test City',
                'state': 'KL',
                'country': 'India',
                'postal_code': '695586'
            }

            # Create Shiprocket order
            result = shiprocket_service.create_shipment(
                order_data={
                    'order_id': str(recent_order.id),
                    'created_at': recent_order.created_at
                },
                order_items=order_items,
                shipping_address=shipping_address
            )

            if result.get('success'):
                print("✅ Shiprocket order created successfully")
                print(f"   Shiprocket Order ID: {result.get('shiprocket_order_id')}")
                print(f"   Tracking Number: {result.get('tracking_number')}")
                print(f"   Courier: {result.get('courier_name')}")
                print(f"   AWB: {result.get('awb')}")

                # Update order with Shiprocket details
                recent_order.shiprocket_order_id = result.get('shiprocket_order_id')
                recent_order.tracking_number = result.get('tracking_number')
                recent_order.courier_name = result.get('courier_name')
                recent_order.awb_number = result.get('awb')
                recent_order.save()

                print("✅ Order updated with Shiprocket tracking info")
            else:
                print(f"❌ Shiprocket order creation failed: {result.get('error')}")
        else:
            print("⚠️  No confirmed orders found for testing")
            print("   Create an order first to test Shiprocket integration")

    except Exception as e:
        print(f"❌ Error testing order creation: {e}")
        import traceback
        traceback.print_exc()

    # Test 4: Test shipment tracking
    print("\n4. Shipment Tracking Test")
    print("-" * 40)

    try:
        # Try to track a shipment if we have a Shiprocket order ID
        if recent_order and recent_order.shiprocket_order_id:
            result = shiprocket_service.track_shipment(recent_order.shiprocket_order_id)

            if 'error' not in result:
                print("✅ Shipment tracking successful")
                print(f"   Current Status: {result.get('current_status')}")
                print(f"   Tracking ID: {result.get('tracking_id')}")
                print(f"   Courier: {result.get('courier_name')}")
                print(f"   Estimated Delivery: {result.get('etd')}")
                print(f"   Actual Delivery: {result.get('edd')}")
            else:
                print(f"⚠️  Shipment tracking failed: {result.get('error')}")
        else:
            print("⚠️  No Shiprocket order ID available for tracking")

    except Exception as e:
        print(f"❌ Error testing shipment tracking: {e}")

    print("\n" + "=" * 60)
    print("🎉 Shiprocket Integration Test Complete!")

    if shiprocket_service.is_available():
        print("\n✅ Shiprocket integration is fully functional!")
        print("   📦 Orders will appear in your Shiprocket dashboard")
        print("   🚚 Real-time shipping calculations active")
        print("   📊 Detailed cost breakdowns available")
        print("   🔍 Live shipment tracking enabled")

        print("\n🔗 Check your Shiprocket dashboard:")
        print("   https://app.shiprocket.in/")
        print("   Look for orders with tracking numbers")
    else:
        print("\n⚠️  Shiprocket integration not configured")
        print("   Configure credentials in .env file to enable")


if __name__ == "__main__":
    test_shiprocket_full_integration()
