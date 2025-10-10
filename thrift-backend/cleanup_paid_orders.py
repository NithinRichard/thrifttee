import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
django.setup()

from apps.orders.models import Order
import razorpay
from django.conf import settings

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

pending_orders = Order.objects.filter(payment_status='pending')

print(f'Checking {pending_orders.count()} pending orders...')

for order in pending_orders:
    try:
        rz_order = client.order.fetch(order.razorpay_order_id)
        if rz_order.get('status') == 'paid':
            order.payment_status = 'completed'
            order.status = 'processing'
            order.save()
            print(f'Updated Order {order.id}: {order.razorpay_order_id} -> completed')
    except Exception as e:
        print(f'Error checking Order {order.id}: {e}')

print('Cleanup complete!')
