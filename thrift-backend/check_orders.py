import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
django.setup()

from apps.orders.models import Order

pending_orders = Order.objects.filter(payment_status='pending').order_by('-created_at')[:5]

print('Pending orders:')
for o in pending_orders:
    print(f'  Order {o.id}: {o.razorpay_order_id} - Status: {o.payment_status}')

if pending_orders:
    latest = pending_orders[0]
    print(f'\nLatest pending order: {latest.razorpay_order_id}')
    
    # Check with Razorpay
    import razorpay
    from django.conf import settings
    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    
    try:
        rz_order = client.order.fetch(latest.razorpay_order_id)
        print(f'Razorpay status: {rz_order.get("status")}')
        
        if rz_order.get('status') == 'paid':
            print('WARNING: Order marked as pending in DB but paid on Razorpay!')
    except Exception as e:
        print(f'Error fetching from Razorpay: {e}')
