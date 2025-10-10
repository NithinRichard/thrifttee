import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
django.setup()

import razorpay
from django.conf import settings

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

print('Testing Razorpay connection...')
print(f'Key ID: {settings.RAZORPAY_KEY_ID}')

try:
    order = client.order.fetch('order_RPpASw8CjTiE1R')
    print('SUCCESS: Order found!')
    print(f'   Status: {order.get("status")}')
    print(f'   Amount: {order.get("amount")}')
    print(f'   Currency: {order.get("currency")}')
except Exception as e:
    print(f'ERROR: {str(e)}')
    print(f'   Type: {type(e).__name__}')
