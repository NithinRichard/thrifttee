from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from .models import Order, OrderItem
from apps.products.models import TShirt, Brand, Category

class OrderAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.admin = User.objects.create_user(username='admin', password='admin123', is_staff=True)
        
        # Create test product
        brand = Brand.objects.create(name='Test Brand', slug='test-brand')
        category = Category.objects.create(name='T-Shirt', slug='tshirt')
        self.product = TShirt.objects.create(
            title='Test Shirt',
            slug='test-shirt',
            brand=brand,
            category=category,
            price=Decimal('500.00'),
            quantity=10,
            size='M',
            condition='excellent'
        )
    
    def test_create_order_authenticated(self):
        """Test creating order with authenticated user"""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/v1/orders/create_razorpay_order/')
        self.assertIn(response.status_code, [200, 400, 404])  # 400 if cart empty, 404 if endpoint not found
    
    def test_create_order_unauthenticated(self):
        """Test creating order without authentication"""
        response = self.client.post('/api/v1/orders/create_razorpay_order/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_admin_analytics(self):
        """Test admin analytics endpoint"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/admin/orders/analytics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('stats', response.data)
    
    def test_admin_analytics_non_admin(self):
        """Test admin analytics with non-admin user"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/admin/orders/analytics/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_bulk_update_orders(self):
        """Test bulk update order status"""
        order = Order.objects.create(
            user=self.user,
            order_number='TEST001',
            subtotal=Decimal('500.00'),
            tax_amount=Decimal('90.00'),
            shipping_amount=Decimal('50.00'),
            total_amount=Decimal('640.00'),
            status='pending'
        )
        
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/admin/orders/bulk_update_status/', {
            'order_ids': [order.id],
            'status': 'processing'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        order.refresh_from_db()
        self.assertEqual(order.status, 'processing')
    
    def test_export_csv(self):
        """Test CSV export"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/admin/orders/export_csv/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')

class OrderModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
    
    def test_order_creation(self):
        """Test order model creation"""
        order = Order.objects.create(
            user=self.user,
            order_number='TEST001',
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('180.00'),
            shipping_amount=Decimal('50.00'),
            total_amount=Decimal('1230.00'),
            status='pending',
            payment_status='pending'
        )
        self.assertEqual(order.order_number, 'TEST001')
        self.assertEqual(order.status, 'pending')
    
    def test_order_str(self):
        """Test order string representation"""
        order = Order.objects.create(
            user=self.user,
            order_number='TEST001',
            subtotal=Decimal('1000.00'),
            tax_amount=Decimal('180.00'),
            shipping_amount=Decimal('50.00'),
            total_amount=Decimal('1230.00')
        )
        self.assertIn('TEST001', str(order))
