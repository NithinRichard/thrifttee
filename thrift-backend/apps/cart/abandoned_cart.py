"""
Abandoned Cart Recovery System
Sends email reminders to users who have items in cart but haven't completed purchase
"""
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .models import Cart

def get_abandoned_carts():
    """Get carts that have been abandoned for 1 hour, 24 hours, or 3 days"""
    now = timezone.now()
    
    # 1 hour ago
    one_hour_ago = now - timedelta(hours=1)
    # 24 hours ago
    one_day_ago = now - timedelta(days=1)
    # 3 days ago
    three_days_ago = now - timedelta(days=3)
    
    # Get carts with items that haven't been updated recently
    abandoned_1h = Cart.objects.filter(
        updated_at__lte=one_hour_ago,
        updated_at__gt=one_hour_ago - timedelta(minutes=10),
        items__isnull=False
    ).distinct()
    
    abandoned_24h = Cart.objects.filter(
        updated_at__lte=one_day_ago,
        updated_at__gt=one_day_ago - timedelta(hours=1),
        items__isnull=False
    ).distinct()
    
    abandoned_3d = Cart.objects.filter(
        updated_at__lte=three_days_ago,
        updated_at__gt=three_days_ago - timedelta(hours=1),
        items__isnull=False
    ).distinct()
    
    return {
        '1_hour': abandoned_1h,
        '24_hours': abandoned_24h,
        '3_days': abandoned_3d
    }

def send_abandoned_cart_email(cart, reminder_type='1_hour'):
    """Send abandoned cart email to user"""
    user = cart.user
    if not user or not user.email:
        return False
    
    # Calculate cart total
    total = sum(item.tshirt.price * item.quantity for item in cart.items.all())
    items = cart.items.all()
    
    # Email subject based on reminder type
    subjects = {
        '1_hour': f'You left {len(items)} item(s) in your cart',
        '24_hours': 'Still thinking about your vintage finds?',
        '3_days': 'Last chance! Your cart items might sell out'
    }
    
    # Email context
    context = {
        'user': user,
        'cart': cart,
        'items': items,
        'total': total,
        'reminder_type': reminder_type,
        'cart_url': f'{settings.FRONTEND_URL}/cart'
    }
    
    # Render email template
    html_message = render_to_string('emails/abandoned_cart.html', context)
    plain_message = render_to_string('emails/abandoned_cart.txt', context)
    
    try:
        send_mail(
            subject=subjects.get(reminder_type, 'Your cart is waiting'),
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f'Failed to send abandoned cart email: {e}')
        return False

def process_abandoned_carts():
    """Process all abandoned carts and send emails"""
    abandoned = get_abandoned_carts()
    
    sent_count = 0
    
    # Send 1-hour reminders
    for cart in abandoned['1_hour']:
        if send_abandoned_cart_email(cart, '1_hour'):
            sent_count += 1
    
    # Send 24-hour reminders
    for cart in abandoned['24_hours']:
        if send_abandoned_cart_email(cart, '24_hours'):
            sent_count += 1
    
    # Send 3-day reminders
    for cart in abandoned['3_days']:
        if send_abandoned_cart_email(cart, '3_days'):
            sent_count += 1
    
    return sent_count
