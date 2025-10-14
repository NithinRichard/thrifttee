from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from .models import Cart, CartItem
from apps.products.models import TShirt, Brand, Category

class CartAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        
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
    
    def test_add_to_cart(self):
        """Test adding item to cart"""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/v1/cart/add/', {
            'product_id': self.product.id,
            'quantity': 2
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_add_to_cart_unauthenticated(self):
        """Test adding to cart without authentication"""
        response = self.client.post('/api/v1/cart/add/', {
            'product_id': self.product.id,
            'quantity': 1
        })
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_201_CREATED])
    
    def test_get_cart(self):
        """Test getting cart"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/cart/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_update_cart_quantity(self):
        """Test updating cart item quantity"""
        self.client.force_authenticate(user=self.user)
        cart = Cart.objects.create(user=self.user)
        cart_item = CartItem.objects.create(
            cart=cart,
            tshirt=self.product,
            quantity=1
        )
        
        response = self.client.put(f'/api/v1/cart/update/{cart_item.id}/', {
            'quantity': 3
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 3)
