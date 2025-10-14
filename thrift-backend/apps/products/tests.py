from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from .models import TShirt, Brand, Category
from apps.common.validators import sanitize_html, validate_email, validate_phone

class ProductAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.brand = Brand.objects.create(name='Test Brand', slug='test-brand')
        self.category = Category.objects.create(name='T-Shirt', slug='tshirt')
        self.product = TShirt.objects.create(
            title='Test Shirt',
            slug='test-shirt',
            brand=self.brand,
            category=self.category,
            price=Decimal('500.00'),
            quantity=10,
            size='M',
            condition='excellent'
        )
    
    def test_list_products(self):
        """Test listing products"""
        response = self.client.get('/api/v1/products/tshirts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_get_product_detail(self):
        """Test getting product detail"""
        response = self.client.get(f'/api/v1/products/tshirts/{self.product.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Shirt')
    
    def test_search_products(self):
        """Test product search"""
        response = self.client.get('/api/v1/products/tshirts/?search=Test')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class ValidatorTestCase(TestCase):
    def test_sanitize_html(self):
        """Test HTML sanitization"""
        dirty = '<script>alert("XSS")</script>Hello'
        clean = sanitize_html(dirty)
        self.assertNotIn('<script>', clean)
        self.assertIn('Hello', clean)
    
    def test_validate_email(self):
        """Test email validation"""
        valid = validate_email('test@example.com')
        self.assertEqual(valid, 'test@example.com')
        
        with self.assertRaises(Exception):
            validate_email('invalid-email')
    
    def test_validate_phone(self):
        """Test phone validation"""
        valid = validate_phone('9876543210')
        self.assertEqual(valid, '9876543210')
        
        with self.assertRaises(Exception):
            validate_phone('123')
