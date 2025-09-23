from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        'tshirt', 'quantity', 'price', 'product_title', 'product_brand',
        'product_size', 'product_color', 'total_price'
    )
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number', 'user', 'status', 'payment_status',
        'total_amount', 'currency', 'created_at'
    )
    list_filter = (
        'status', 'payment_status', 'payment_method', 'currency', 'created_at'
    )
    search_fields = (
        'order_number', 'user__username', 'user__email', 'shipping_email',
        'transaction_id', 'auth_code'
    )
    readonly_fields = (
        'order_number', 'created_at', 'updated_at', 'shipped_at', 'delivered_at',
        'payment_gateway_response'
    )
    inlines = [OrderItemInline]
    fieldsets = (
        ('Order Info', {
            'fields': (
                'order_number', 'user', 'status', 'payment_status',
                'subtotal', 'tax_amount', 'shipping_amount', 'total_amount',
                'currency', 'notes'
            )
        }),
        ('Shipping', {
            'fields': (
                'shipping_name', 'shipping_email', 'shipping_phone',
                'shipping_address_line1', 'shipping_address_line2',
                'shipping_city', 'shipping_state', 'shipping_postal_code', 'shipping_country'
            )
        }),
        ('Payment', {
            'fields': (
                'payment_method', 'payment_token', 'transaction_id', 'auth_code', 'payment_gateway_response'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'shipped_at', 'delivered_at')
        })
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        'order', 'tshirt', 'quantity', 'price', 'total_price',
        'product_title', 'product_brand', 'product_size', 'product_color'
    )
    search_fields = (
        'order__order_number', 'product_title', 'product_brand'
    )
    list_filter = ('product_brand', 'product_size', 'product_color')
