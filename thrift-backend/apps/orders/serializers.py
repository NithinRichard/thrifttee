from rest_framework import serializers
from decimal import Decimal, InvalidOperation
from django.db import transaction
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    """Order item serializer."""

    class Meta:
        model = OrderItem
        fields = [
            'id', 'tshirt', 'quantity', 'price', 'total_price',
            'product_title', 'product_brand', 'product_size', 'product_color'
        ]

class OrderSerializer(serializers.ModelSerializer):
    """Order serializer."""
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status', 'subtotal',
            'tax_amount', 'shipping_amount', 'total_amount', 'items',
            'payment_method', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature',
            'currency', 'notes', 'payment_gateway_response',
            'shipping_name', 'shipping_email', 'shipping_phone',
            'shipping_address_line1', 'shipping_address_line2',
            'shipping_city', 'shipping_state', 'shipping_postal_code',
            'shipping_country', 'created_at', 'updated_at', 'shipped_at', 'delivered_at'
        ]
        read_only_fields = ['order_number', 'created_at', 'updated_at']

class CreateOrderSerializer(serializers.ModelSerializer):
    """Create order serializer with Rupay payment integration."""

    # Customer information
    customer_info = serializers.JSONField(required=True)

    # Order items
    order_items = serializers.JSONField(required=True)

    # Optional transaction details from gateway
    transaction_details = serializers.JSONField(required=False, default=dict)

    # Optional flat shipping address string
    shipping_address = serializers.CharField(required=False, allow_blank=True)

    # Override payment_status to bypass model ChoiceField validation so we can
    # normalize friendly frontend statuses like "success" -> "completed" first
    payment_status = serializers.CharField(required=False, allow_blank=True)

    # Pricing information (with defaults)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    tax_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    shipping_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    # Optional fields
    currency = serializers.CharField(max_length=3, required=False, default='INR')
    notes = serializers.CharField(required=False, allow_blank=True)
    class Meta:
        model = Order
        fields = [
            'customer_info', 'order_items', 'payment_method',
            'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'payment_status', 'transaction_details',
            'currency', 'notes', 'subtotal', 'tax_amount',
            'shipping_amount', 'total_amount', 'shipping_address'
        ]

    def validate(self, attrs):
        """Normalize incoming payment status and monetary fields."""
        # Normalize payment_status values from frontend (e.g., 'success' -> 'completed')
        status = attrs.get('payment_status')
        if isinstance(status, str):
            normalized = status.lower().strip()
            mapping = {
                'success': 'completed',
                'succeeded': 'completed',
                'paid': 'completed',
                'complete': 'completed',
            }
            attrs['payment_status'] = mapping.get(normalized, normalized)

        # Normalize amounts to 2 decimal places and within max_digits
        def to_amount(value, fallback=None):
            if value in (None, ''):
                return fallback
            try:
                amt = Decimal(str(value))
                # Quantize to 2 dp
                return amt.quantize(Decimal('0.01'))
            except (InvalidOperation, ValueError):
                return fallback

        subtotal = to_amount(attrs.get('subtotal'), Decimal('0.00'))
        tax_amount = to_amount(attrs.get('tax_amount'))
        shipping_amount = to_amount(attrs.get('shipping_amount'))

        # Recalculate sensible defaults if not provided or invalid
        if tax_amount is None:
            tax_amount = (subtotal * Decimal('0.18')).quantize(Decimal('0.01'))
        if shipping_amount is None:
            shipping_amount = Decimal('0.00') if subtotal >= Decimal('1000') else Decimal('50.00')

        total_amount = to_amount(attrs.get('total_amount'))
        if total_amount is None:
            total_amount = (subtotal + tax_amount + shipping_amount).quantize(Decimal('0.01'))

        attrs['subtotal'] = subtotal
        attrs['tax_amount'] = tax_amount
        attrs['shipping_amount'] = shipping_amount
        attrs['total_amount'] = total_amount

        return attrs

    def create(self, validated_data):
        """Create order with items and payment information."""
        customer_info = validated_data.pop('customer_info')
        order_items_data = validated_data.pop('order_items')
        transaction_details = validated_data.pop('transaction_details', {})

        # Handle shipping address from form data
        shipping_address = validated_data.pop('shipping_address', '')
        if shipping_address and ',' in shipping_address:
            # Parse shipping address format: "address, city, state zip"
            parts = [part.strip() for part in shipping_address.split(',')]
            if len(parts) >= 3:
                shipping_address_line1 = parts[0]
                shipping_city = parts[1]
                state_zip = parts[2].split()
                shipping_state = state_zip[0] if len(state_zip) > 0 else ''
                shipping_postal_code = state_zip[1] if len(state_zip) > 1 else ''
            else:
                shipping_address_line1 = shipping_address
                shipping_city = validated_data.get('shipping_city', '')
                shipping_state = validated_data.get('shipping_state', '')
                shipping_postal_code = validated_data.get('shipping_postal_code', '')
        else:
            shipping_address_line1 = shipping_address
            shipping_city = validated_data.get('shipping_city', '')
            shipping_state = validated_data.get('shipping_state', '')
            shipping_postal_code = validated_data.get('shipping_postal_code', '')

        # Calculate totals if not provided (ensure Decimal types)
        from decimal import Decimal

        subtotal = validated_data.get('subtotal')
        if subtotal is None:
            subtotal = Decimal('0.00')

        tax_amount = validated_data.get('tax_amount')
        if tax_amount is None:
            tax_amount = (subtotal * Decimal('0.18')).quantize(Decimal('0.01'))  # 18% GST

        shipping_amount = validated_data.get('shipping_amount')
        if shipping_amount is None:
            shipping_amount = Decimal('0.00') if subtotal >= Decimal('1000') else Decimal('50.00')  # Free shipping over ₹1000

        total_amount = validated_data.get('total_amount')
        if total_amount is None:
            total_amount = (subtotal + tax_amount + shipping_amount).quantize(Decimal('0.01'))

        # Wrap order creation and item creation in a single transaction
        with transaction.atomic():
            # Create order
            order = Order.objects.create(
                user=self.context['request'].user,
                shipping_name=customer_info['name'],
                shipping_email=customer_info['email'],
                shipping_address_line1=shipping_address_line1,
                shipping_city=shipping_city,
                shipping_state=shipping_state,
                shipping_postal_code=shipping_postal_code,
                payment_method=validated_data.get('payment_method', 'razorpay'),
                razorpay_order_id=validated_data.get('razorpay_order_id', ''),
                razorpay_payment_id=validated_data.get('razorpay_payment_id', ''),
                razorpay_signature=validated_data.get('razorpay_signature', ''),
                payment_status=validated_data.get('payment_status', 'pending'),
                transaction_id=transaction_details.get('transaction_id', ''),
                currency=validated_data.get('currency', 'INR'),
                subtotal=subtotal,
                tax_amount=tax_amount,
                shipping_amount=shipping_amount,
                total_amount=total_amount,
                notes=validated_data.get('notes', '')
            )

            # Create order items
            from apps.products.models import TShirt
            for item_data in order_items_data:
                try:
                    tshirt = TShirt.objects.get(id=item_data['product'])
                    OrderItem.objects.create(
                        order=order,
                        tshirt=tshirt,
                        quantity=item_data['quantity'],
                        price=tshirt.price,  # Current price
                        product_title=tshirt.title,
                        product_brand=tshirt.brand,
                        product_size=tshirt.size,
                        product_color=tshirt.color
                    )
                except TShirt.DoesNotExist:
                    # Create item with stored product data if product doesn't exist
                    OrderItem.objects.create(
                        order=order,
                        tshirt=None,  # No associated TShirt object
                        quantity=item_data['quantity'],
                        price=item_data.get('price', 0),
                        product_title=item_data.get('title', 'Unknown Product'),
                        product_brand=item_data.get('brand', 'Unknown Brand'),
                        product_size=item_data.get('size', 'N/A'),
                        product_color=item_data.get('color', 'N/A')
                    )

        return order

class PaymentVerificationSerializer(serializers.Serializer):
    """Serializer for payment verification requests."""
    transaction_id = serializers.CharField(required=True)
    order_id = serializers.IntegerField(required=True)

    def validate_transaction_id(self, value):
        """Validate transaction ID format."""
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Invalid transaction ID format")
        return value.strip()