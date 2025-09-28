"""
Shiprocket API Integration Service
Handles shipping rate calculation, order creation, and tracking
"""

import os
import json
from decimal import Decimal
from django.conf import settings
import requests
import logging

logger = logging.getLogger(__name__)


class ShiprocketAPI:
    """Custom Shiprocket API implementation using requests"""

    BASE_URL = 'https://apiv2.shiprocket.in/v1/external'

    def __init__(self, email, password):
        self.email = email
        self.password = password
        self.token = None
        self._authenticate()

    def _authenticate(self):
        """Authenticate with Shiprocket API"""
        url = f"{self.BASE_URL}/auth/login"
        payload = {
            'email': self.email,
            'password': self.password
        }

        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            self.token = data.get('token')
        except Exception as e:
            logger.error(f"Shiprocket authentication failed: {e}")
            self.token = None

    def _make_request(self, method, endpoint, data=None):
        """Make authenticated request to Shiprocket API"""
        if not self.token:
            return None

        url = f"{self.BASE_URL}{endpoint}"
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, headers=headers, json=data)
            else:
                return None

            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Shiprocket API request failed: {e}")
            return None

    def check_serviceability(self, shipment_data):
        """Check serviceability for shipment"""
        return self._make_request('POST', '/courier/serviceability', shipment_data)

    def create_order(self, order_data):
        """Create a new order"""
        return self._make_request('POST', '/orders/create/adhoc', order_data)

    def track_order(self, order_id):
        """Track order status"""
        return self._make_request('GET', f'/orders/track/{order_id}')


class ShiprocketService:
    """Service class for Shiprocket API integration"""

    def __init__(self):
        # Shiprocket credentials from settings
        self.api_email = getattr(settings, 'SHIPROCKET_EMAIL', '')
        self.api_password = getattr(settings, 'SHIPROCKET_PASSWORD', '')
        self.api_token = None
        self.api_client = None

        # Initialize Shiprocket API client
        if self.api_email and self.api_password:
            try:
                self.api_client = ShiprocketAPI(self.api_email, self.api_password)
                logger.info("Shiprocket API client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Shiprocket API client: {e}")
                self.api_client = None
        else:
            logger.warning("Shiprocket credentials not configured")

    def is_available(self):
        """Check if Shiprocket service is available"""
        return self.api_client is not None and self.api_client.token is not None

    def calculate_shipping_rate(self, order_items, shipping_address, pickup_address=None):
        """
        Calculate shipping rate using Shiprocket API

        Args:
            order_items: List of order items with product and quantity
            shipping_address: Dict with address details
            pickup_address: Dict with pickup address (optional)

        Returns:
            Dict with shipping cost and breakdown
        """
        if not self.is_available():
            return {
                'error': 'Shiprocket service not available',
                'shipping_cost': 0
            }

        try:
            # Prepare shipment data
            shipment_data = self._prepare_shipment_data(order_items, shipping_address, pickup_address)

            # Get shipping rates from Shiprocket
            rates_response = self.api_client.check_serviceability(shipment_data)

            if rates_response and rates_response.get('status') == 200:
                available_rates = rates_response.get('data', {}).get('available_courier_companies', [])

                if available_rates:
                    # Get the cheapest rate
                    cheapest_rate = min(available_rates, key=lambda x: x.get('rate', float('inf')))

                    rate = cheapest_rate.get('rate', 0)
                    courier_name = cheapest_rate.get('courier_name', 'Standard Shipping')
                    estimated_days = cheapest_rate.get('estimated_delivery_days', 4)

                    # Calculate weight and dimensions
                    total_weight = self._calculate_total_weight(order_items)
                    total_value = self._calculate_total_value(order_items)

                    # Prepare breakdown
                    breakdown = {
                        'base_cost': float(rate),
                        'weight_cost': 0,  # Shiprocket includes weight in base rate
                        'insurance_cost': float(total_value * Decimal('0.02')),  # 2% insurance
                        'method_multiplier': 1.0,
                        'free_shipping_applied': False,
                        'courier': courier_name,
                        'shiprocket_rate': True
                    }

                    return {
                        'shipping_cost': float(rate),
                        'method': courier_name,
                        'estimated_days': estimated_days,
                        'zone': 'India',
                        'breakdown': breakdown,
                        'shiprocket_data': cheapest_rate
                    }

            # Fallback to standard rates if Shiprocket fails
            return self._get_fallback_shipping_rate(order_items, shipping_address)

        except Exception as e:
            logger.error(f"Shiprocket rate calculation failed: {e}")
            return self._get_fallback_shipping_rate(order_items, shipping_address)

    def create_shipment(self, order_data, order_items, shipping_address, pickup_address=None):
        """
        Create a shipment order in Shiprocket

        Args:
            order_data: Order information
            order_items: List of order items
            shipping_address: Customer shipping address
            pickup_address: Pickup address

        Returns:
            Dict with shipment details and tracking info
        """
        if not self.is_available():
            return {'error': 'Shiprocket service not available'}

        try:
            # Prepare order data for Shiprocket
            shiprocket_order = self._prepare_shiprocket_order(order_data, order_items, shipping_address, pickup_address)

            # Create order in Shiprocket
            response = self.api_client.create_order(shiprocket_order)

            if response and response.get('status') == 200:
                order_id = response.get('order_id')
                tracking_data = response.get('tracking_data', {})

                return {
                    'success': True,
                    'shiprocket_order_id': order_id,
                    'tracking_number': tracking_data.get('tracking_id'),
                    'courier_name': tracking_data.get('courier_name'),
                    'awb': tracking_data.get('awb_code'),
                    'estimated_delivery': tracking_data.get('etd')
                }
            else:
                return {'error': 'Failed to create Shiprocket order', 'details': response}

        except Exception as e:
            logger.error(f"Shiprocket order creation failed: {e}")
            return {'error': str(e)}

    def track_shipment(self, shiprocket_order_id):
        """
        Track shipment status using Shiprocket order ID

        Args:
            shiprocket_order_id: Shiprocket order ID

        Returns:
            Dict with tracking information
        """
        if not self.is_available():
            return {'error': 'Shiprocket service not available'}

        try:
            response = self.api_client.track_order(shiprocket_order_id)

            if response and response.get('status') == 200:
                tracking_data = response.get('tracking_data', {})

                return {
                    'current_status': tracking_data.get('current_status'),
                    'tracking_id': tracking_data.get('tracking_id'),
                    'courier_name': tracking_data.get('courier_name'),
                    'etd': tracking_data.get('etd'),
                    'edd': tracking_data.get('edd'),
                    'tracking_url': tracking_data.get('tracking_url')
                }
            else:
                return {'error': 'Failed to track shipment'}

        except Exception as e:
            logger.error(f"Shiprocket tracking failed: {e}")
            return {'error': str(e)}

    def _prepare_shipment_data(self, order_items, shipping_address, pickup_address=None):
        """Prepare shipment data for Shiprocket API"""

        # Default pickup address (you should configure this)
        if not pickup_address:
            pickup_address = {
                'name': 'ThriftTees Warehouse',
                'company_name': 'ThriftTees',
                'address': '123 Business District',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'country': 'India',
                'pincode': '400001',
                'phone': '9876543210',
                'email': 'warehouse@thrifttees.com'
            }

        # Calculate weight and dimensions
        total_weight = self._calculate_total_weight(order_items)
        dimensions = self._calculate_package_dimensions(order_items)

        shipment_data = {
            'pickup_postcode': pickup_address.get('pincode', '400001'),
            'delivery_postcode': shipping_address.get('postal_code', ''),
            'cod': 0,  # 0 for prepaid, 1 for COD
            'weight': total_weight,
            'value': self._calculate_total_value(order_items),
            'length': dimensions.get('length', 20),
            'breadth': dimensions.get('breadth', 15),
            'height': dimensions.get('height', 10)
        }

        return shipment_data

    def _prepare_shiprocket_order(self, order_data, order_items, shipping_address, pickup_address=None):
        """Prepare order data for Shiprocket API"""

        # Order items for Shiprocket
        order_items_data = []
        for item in order_items:
            product = item.get('product', {})
            quantity = item.get('quantity', 1)

            order_items_data.append({
                'name': product.get('title', 'Product')[:50],  # Shiprocket has 50 char limit
                'sku': product.get('sku', product.get('id', '')),
                'units': quantity,
                'selling_price': float(product.get('price', 0)),
                'discount': 0,
                'tax': 0,
                'hsn': '62052000'  # Default HSN for clothing
            })

        # Customer details
        customer_details = {
            'name': shipping_address.get('name', ''),
            'email': shipping_address.get('email', ''),
            'phone': shipping_address.get('phone', ''),
            'address': shipping_address.get('address', ''),
            'address_2': shipping_address.get('address_2', ''),
            'city': shipping_address.get('city', ''),
            'state': shipping_address.get('state', ''),
            'country': shipping_address.get('country', 'India'),
            'pincode': shipping_address.get('postal_code', '')
        }

        # Pickup address
        if not pickup_address:
            pickup_address = {
                'name': 'ThriftTees Warehouse',
                'company_name': 'ThriftTees',
                'address': '123 Business District',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'country': 'India',
                'pincode': '400001',
                'phone': '9876543210',
                'email': 'warehouse@thrifttees.com'
            }

        return {
            'order_id': order_data.get('order_id', ''),
            'order_date': order_data.get('created_at', '').strftime('%Y-%m-%d %H:%M'),
            'channel_id': getattr(settings, 'SHIPROCKET_CHANNEL_ID', ''),
            'billing_customer_name': customer_details['name'],
            'billing_last_name': '',
            'billing_address': customer_details['address'],
            'billing_address_2': customer_details['address_2'],
            'billing_city': customer_details['city'],
            'billing_pincode': customer_details['pincode'],
            'billing_state': customer_details['state'],
            'billing_country': customer_details['country'],
            'billing_email': customer_details['email'],
            'billing_phone': customer_details['phone'],
            'shipping_is_billing': True,
            'order_items': order_items_data,
            'payment_method': 'Prepaid',
            'sub_total': self._calculate_total_value(order_items),
            'length': 20,
            'breadth': 15,
            'height': 10,
            'weight': self._calculate_total_weight(order_items)
        }

    def _calculate_total_weight(self, order_items):
        """Calculate total weight of order items"""
        total_weight = Decimal('0')

        for item in order_items:
            product = item.get('product', {})
            quantity = item.get('quantity', 1)

            # Use product weight if available, otherwise default to 200g per item
            weight_grams = getattr(product, 'weight_grams', 200)
            weight_kg = Decimal(str(weight_grams)) / Decimal('1000') * quantity
            total_weight += weight_kg

        return float(max(total_weight, Decimal('0.1')))  # Minimum 100g

    def _calculate_total_value(self, order_items):
        """Calculate total value of order items"""
        total_value = Decimal('0')

        for item in order_items:
            product = item.get('product', {})
            quantity = item.get('quantity', 1)

            price = getattr(product, 'price', Decimal('0'))
            total_value += price * quantity

        return float(total_value)

    def _calculate_package_dimensions(self, order_items):
        """Calculate package dimensions based on items"""
        # Simple dimension calculation - you might want to make this more sophisticated
        return {
            'length': 20,  # cm
            'breadth': 15,  # cm
            'height': 10   # cm
        }

    def _get_fallback_shipping_rate(self, order_items, shipping_address):
        """Fallback shipping calculation when Shiprocket is unavailable"""
        from apps.products.models import ShippingCalculator

        # Use the existing static calculation as fallback
        return ShippingCalculator.calculate_shipping_cost(
            order_items,
            shipping_address
        )


# Global Shiprocket service instance
shiprocket_service = ShiprocketService()
