#!/usr/bin/env python3
"""
Quick Order Creation Test
Tests the updated order creation with required pricing fields
"""

import os
import sys
import django
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from apps.products.models import TShirt, Brand

def test_order_creation():
    """Test order creation with pricing fields."""
    print("🧪 Testing Order Creation with Pricing Fields...")

    # Get or create test user
    try:
        user = User.objects.get(username='testuser')
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    # Get or create test brand and product
    try:
        brand = Brand.objects.get(name='Test Brand')
    except Brand.DoesNotExist:
        brand = Brand.objects.create(
            name='Test Brand',
            slug='test-brand',
            description='Test brand for testing'
        )

    try:
        tshirt = TShirt.objects.get(title='Test T-Shirt')
    except TShirt.DoesNotExist:
        tshirt = TShirt.objects.create(
            title='Test T-Shirt',
            slug='test-t-shirt',
            description='Test T-shirt for testing',
            brand=brand,
            size='m',
            color='Blue',
            material='100% Cotton',
            gender='unisex',
            condition='excellent',
            price=500,
            original_price=600,
            is_available=True,
            is_featured=False,
            quantity=10,
            meta_description='Test T-shirt for testing',
            tags='test,t-shirt,cotton'
        )

    print("✅ Test data ready")

    # Create test client
    client = Client()
    client.login(username='testuser', password='testpass123')

    # Test order data with all required fields
    order_data = {
        "customer_info": {
            "name": "Test User",
            "email": "test@example.com"
        },
        "order_items": [
            {
                "product": tshirt.id,
                "quantity": 2,
                "price": 500,
                "title": "Test T-Shirt",
                "brand": "Test Brand",
                "size": "m",
                "color": "Blue"
            }
        ],
        "shipping_address": "123 Test Street, Mumbai, Maharashtra 400001",
        "payment_method": "rupay",
        "payment_token": "DEMO_TXN_1234567890_abc123",
        "payment_status": "completed",
        "transaction_details": {
            "transaction_id": "DEMO_TXN_1234567890_abc123",
            "auth_code": "DEMO_AUTH_xyz789"
        },
        "subtotal": 1000,
        "tax_amount": 180,
        "shipping_amount": 0,
        "total_amount": 1180,
        "currency": "INR",
        "notes": "Demo mode order"
    }

    print("📦 Sending order data to backend...")

    # Make POST request
    response = client.post(
        '/api/v1/orders/',
        data=json.dumps(order_data),
        content_type='application/json'
    )

    print(f"📊 Response Status: {response.status_code}")

    if response.status_code == 201:
        order_response = response.json()
        print("✅ Order created successfully!")
        print(f"   Order Number: {order_response['order_number']}")
        print(f"   Payment Method: {order_response['payment_method']}")
        print(f"   Payment Status: {order_response['payment_status']}")
        print(f"   Total Amount: ₹{order_response['total_amount']}")
        print(f"   Items Count: {len(order_response['items'])}")
        print(f"   Transaction ID: {order_response.get('transaction_id', 'N/A')}")
        print("🎉 Order creation test PASSED!")
        return True
    else:
        print(f"❌ Order creation failed: {response.json()}")
        return False

def test_minimal_order_data():
    """Test order creation with minimal required data."""
    print("\n🧪 Testing with minimal required data...")

    # Get test user and client
    try:
        user = User.objects.get(username='testuser')
    except User.DoesNotExist:
        print("❌ Test user not found")
        return False

    client = Client()
    client.login(username='testuser', password='testpass123')

    # Get first available product or create one
    from apps.products.models import TShirt, Brand

    try:
        tshirt = TShirt.objects.first()
        if not tshirt:
            # Create a minimal test product
            brand = Brand.objects.first()
            if not brand:
                brand = Brand.objects.create(
                    name='Test Brand',
                    slug='test-brand',
                    description='Test brand'
                )
            tshirt = TShirt.objects.create(
                title='Test Product',
                slug='test-product',
                description='Test product for minimal test',
                brand=brand,
                size='m',
                color='Black',
                material='Cotton',
                gender='unisex',
                condition='good',
                price=250,
                is_available=True,
                quantity=5
            )
    except Exception as e:
        print(f"❌ Error getting/creating test product: {e}")
        return False

    # Minimal order data (let backend calculate totals)
    minimal_order_data = {
        "customer_info": {
            "name": "Minimal Test User",
            "email": "minimal@example.com"
        },
        "order_items": [
            {
                "product": tshirt.id,
                "quantity": 1,
                "price": tshirt.price,
                "title": tshirt.title,
                "brand": tshirt.brand.name,
                "size": tshirt.size,
                "color": tshirt.color
            }
        ],
        "shipping_address": "456 Minimal Street, Delhi, Delhi 110001",
        "payment_method": "rupay",
        "payment_token": "MINIMAL_DEMO_TOKEN",
        "payment_status": "pending"
        # Note: subtotal, tax_amount, shipping_amount, total_amount not provided
        # Backend should calculate these automatically
    }

    print("📦 Sending minimal order data...")

    response = client.post(
        '/api/v1/orders/',
        data=json.dumps(minimal_order_data),
        content_type='application/json'
    )

    print(f"📊 Response Status: {response.status_code}")

    if response.status_code == 201:
        order_response = response.json()
        print("✅ Minimal order creation successful!")
        print(f"   Calculated Subtotal: ₹{order_response['subtotal']}")
        print(f"   Calculated Tax: ₹{order_response['tax_amount']}")
        print(f"   Calculated Total: ₹{order_response['total_amount']}")
        print("🎉 Minimal data test PASSED!")
        return True
    else:
        print(f"❌ Minimal order creation failed: {response.json()}")
        return False

if __name__ == '__main__':
    print("🚀 Starting Order Creation Tests...")

    success1 = test_order_creation()
    success2 = test_minimal_order_data()

    if success1 and success2:
        print("\n🎉 All tests PASSED! Order creation is working correctly.")
        sys.exit(0)
    else:
        print("\n❌ Some tests FAILED. Check the output above.")
        sys.exit(1)
