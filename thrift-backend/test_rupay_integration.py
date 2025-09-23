#!/usr/bin/env python3
"""
Rupay Payment Integration Test Script
Tests the backend implementation for Rupay payment processing
"""

import os
import sys
import django
from django.test import TestCase
from django.contrib.auth.models import User
from django.test import Client
from django.urls import reverse
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
django.setup()

from apps.orders.models import Order, OrderItem
from apps.products.models import TShirt, Brand

def test_rupay_integration():
    """Test Rupay payment integration functionality."""
    print("🧪 Testing Rupay Payment Integration...")

    # Create test user
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()

    # Create test brand and product
    brand, created = Brand.objects.get_or_create(
        name='Test Brand',
        defaults={'description': 'Test brand for testing'}
    )

    tshirt, created = TShirt.objects.get_or_create(
        title='Test T-Shirt',
        defaults={
            'brand': brand,
            'description': 'Test T-shirt for testing',
            'price': 500,
            'size': 'M',
            'color': 'Blue',
            'stock': 10
        }
    )

    print("✅ Test data created successfully")

    # Test order creation with Rupay payment data
    client = Client()
    client.login(username='testuser', password='testpass123')

    order_data = {
        'customer_info': {
            'name': 'Test User',
            'email': 'test@example.com'
        },
        'order_items': [
            {
                'product': tshirt.id,
                'quantity': 2,
                'price': 500,
                'title': 'Test T-Shirt',
                'brand': 'Test Brand',
                'size': 'M',
                'color': 'Blue'
            }
        ],
        'payment_method': 'rupay',
        'payment_token': 'rupay_test_token_123',
        'payment_status': 'completed',
        'transaction_details': {
            'transaction_id': 'TXN_123456789',
            'auth_code': 'AUTH_987654'
        },
        'subtotal': 1000,
        'tax_amount': 180,
        'shipping_amount': 0,
        'total_amount': 1180,
        'currency': 'INR'
    }

    # Test order creation
    response = client.post(
        '/api/v1/orders/',
        data=json.dumps(order_data),
        content_type='application/json'
    )

    print(f"📦 Order creation response status: {response.status_code}")

    if response.status_code == 201:
        order_data = response.json()
        print(f"✅ Order created successfully: {order_data['order_number']}")
        print(f"💳 Payment method: {order_data['payment_method']}")
        print(f"💰 Total amount: ₹{order_data['total_amount']}")
        print(f"📊 Payment status: {order_data['payment_status']}")

        # Test payment verification
        verification_data = {
            'transaction_id': 'TXN_123456789',
            'order_id': order_data['id']
        }

        verify_response = client.post(
            '/api/v1/orders/verify_payment/',
            data=json.dumps(verification_data),
            content_type='application/json'
        )

        print(f"🔍 Payment verification response: {verify_response.status_code}")

        if verify_response.status_code == 200:
            verify_data = verify_response.json()
            print(f"✅ Payment verified: {verify_data['message']}")
        else:
            print(f"❌ Payment verification failed: {verify_response.json()}")

    else:
        print(f"❌ Order creation failed: {response.json()}")

    # Test legacy payment endpoints
    print("\n🔄 Testing legacy payment endpoints...")

    payment_intent_response = client.post(
        '/api/v1/orders/payment/create-intent/',
        data=json.dumps({'payment_method': 'rupay'}),
        content_type='application/json'
    )

    print(f"💳 Payment intent response: {payment_intent_response.status_code}")

    if payment_intent_response.status_code == 200:
        intent_data = payment_intent_response.json()
        print(f"✅ Payment intent created: {intent_data['payment_intent_id']}")

    print("\n🎉 Rupay integration test completed!")

if __name__ == '__main__':
    test_rupay_integration()
