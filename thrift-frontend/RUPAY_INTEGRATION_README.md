# Rupay Payment Integration - Backend Implementation Guide

## Overview
This frontend now supports Rupay payment processing through NPCI's payment gateway. To complete the integration, you need to implement the backend Orders endpoint and Rupay gateway integration.

## Backend Requirements

### 1. Django Models
Create an Order model in your Django backend:

```python
# models.py
from django.db import models
from django.contrib.auth.models import User

class Order(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order_number = models.CharField(max_length=100, unique=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20)  # 'rupay', 'card', etc.
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')

    # Rupay specific fields
    payment_token = models.CharField(max_length=100, blank=True, null=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    auth_code = models.CharField(max_length=50, blank=True, null=True)

    # Customer info
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    shipping_address = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.order_number}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"
```

### 2. Django REST Framework Views
Create a ViewSet for order management:

```python
# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import uuid

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.all()

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def create(self, request):
        data = request.data
        user = request.user

        # Generate order number
        order_number = f"ORD-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

        # Create order
        order = Order.objects.create(
            user=user,
            order_number=order_number,
            total_amount=data['total_amount'],
            payment_method=data['payment_method'],
            customer_name=data['customer_info']['name'],
            customer_email=data['customer_info']['email'],
            shipping_address=data['shipping_address'],
            payment_token=data.get('payment_token'),
            transaction_id=data.get('transaction_id'),
            auth_code=data.get('auth_code')
        )

        # Create order items
        for item_data in data['order_items']:
            OrderItem.objects.create(
                order=order,
                product_id=item_data['product'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )

        return Response({
            'id': order.id,
            'order_number': order.order_number,
            'status': 'success',
            'message': 'Order created successfully'
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def verify_payment(self, request):
        """Verify Rupay payment status"""
        transaction_id = request.data.get('transaction_id')

        # Here you would integrate with Rupay gateway API
        # to verify the payment status

        try:
            # Mock verification for demo
            order = Order.objects.get(transaction_id=transaction_id, user=request.user)
            order.payment_status = 'completed'
            order.save()

            return Response({'status': 'success', 'message': 'Payment verified'})
        except Order.DoesNotExist:
            return Response({'status': 'error', 'message': 'Order not found'}, status=404)
```

### 3. URL Configuration
Add the order URLs to your main urls.py:

```python
# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('api/v1/', include(router.urls)),
    # ... other URLs
]
```

### 4. Rupay Gateway Integration
For production, implement actual Rupay gateway integration:

```python
# services.py
import requests
from django.conf import settings

class RupayGateway:
    BASE_URL = 'https://api.rupay.npci.org.in'  # Production URL

    @staticmethod
    def initialize_payment(payment_data):
        """Initialize payment session with Rupay"""
        headers = {
            'Content-Type': 'application/json',
            'X-API-Key': settings.RUPAY_MERCHANT_ID
        }

        payload = {
            'merchantId': settings.RUPAY_MERCHANT_ID,
            'terminalId': settings.RUPAY_TERMINAL_ID,
            'amount': payment_data['amount'],
            'currency': 'INR',
            'orderId': payment_data['orderId']
        }

        response = requests.post(
            f'{RupayGateway.BASE_URL}/payment/init',
            json=payload,
            headers=headers
        )

        return response.json()

    @staticmethod
    def process_payment(payment_details):
        """Process the actual payment"""
        headers = {
            'Content-Type': 'application/json',
            'X-Session-Token': payment_details['sessionToken']
        }

        payload = {
            'cardNumber': payment_details['cardNumber'].replace(' ', ''),
            'expiryDate': payment_details['expiryDate'].replace('/', ''),
            'cvv': payment_details['cvv'],
            'cardholderName': payment_details['cardholderName'],
            'amount': payment_details['amount']
        }

        response = requests.post(
            f'{RupayGateway.BASE_URL}/payment/process',
            json=payload,
            headers=headers
        )

        return response.json()

    @staticmethod
    def verify_payment(transaction_id):
        """Verify payment status"""
        headers = {
            'X-API-Key': settings.RUPAY_MERCHANT_ID
        }

        response = requests.get(
            f'{RupayGateway.BASE_URL}/payment/verify/{transaction_id}',
            headers=headers
        )

        return response.json()
```

### 5. Settings Configuration
Add Rupay configuration to Django settings:

```python
# settings.py
RUPAY_MERCHANT_ID = 'your_merchant_id'
RUPAY_TERMINAL_ID = 'your_terminal_id'
RUPAY_API_KEY = 'your_api_key'
RUPAY_ENVIRONMENT = 'test'  # or 'production'
```

## Environment Variables
Create a `.env` file for the frontend:

```env
REACT_APP_RUPAY_MERCHANT_ID=your_merchant_id
REACT_APP_RUPAY_TERMINAL_ID=your_terminal_id
```

## Security Considerations

1. **HTTPS Only**: Ensure all payment endpoints use HTTPS
2. **Tokenization**: Never store raw card data in your database
3. **Validation**: Implement server-side validation for all payment data
4. **Logging**: Avoid logging sensitive payment information
5. **Rate Limiting**: Implement rate limiting on payment endpoints

## Testing

1. **Test Environment**: Use Rupay test gateway for development
2. **Mock Payments**: Test with mock payment responses
3. **Error Handling**: Test various failure scenarios
4. **Security Testing**: Perform security testing before production

## Production Deployment

1. **SSL Certificate**: Ensure valid SSL certificate
2. **Environment Variables**: Set production Rupay credentials
3. **Monitoring**: Implement payment monitoring and alerting
4. **Backup**: Ensure payment data backup procedures
5. **Compliance**: Ensure PCI DSS compliance

## Support

For Rupay integration support:
- NPCI Rupay Documentation: https://rupay.npci.org.in
- Merchant Integration Guide: Available from your payment processor
- Technical Support: Contact NPCI or your payment service provider
