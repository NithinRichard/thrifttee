import re
import bleach
from django.core.exceptions import ValidationError

def sanitize_html(text):
    """Remove all HTML tags and scripts from text"""
    if not text:
        return text
    return bleach.clean(text, tags=[], strip=True)

def validate_email(email):
    """Validate email format"""
    if not email:
        return ''
    email = email.strip().lower()
    # Reject consecutive dots
    if '..' in email:
        raise ValidationError('Invalid email format')
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError('Invalid email format')
    return email

def validate_phone(phone):
    """Validate Indian phone number"""
    if not phone:
        return ''
    cleaned = re.sub(r'[^\d+]', '', str(phone))
    # Accept: 9876543210, +919876543210, 919876543210
    if re.match(r'^[6-9]\d{9}$', cleaned):  # 10 digits starting with 6-9
        return cleaned
    elif re.match(r'^\+?91[6-9]\d{9}$', cleaned):  # With country code
        return cleaned
    raise ValidationError('Invalid phone number')

def validate_pincode(pincode):
    """Validate Indian PIN code"""
    pattern = r'^\d{6}$'
    if not re.match(pattern, str(pincode)):
        raise ValidationError('Invalid PIN code')
    return str(pincode)

def sanitize_search_query(query):
    """Sanitize search query to prevent SQL injection"""
    if not query:
        return ''
    # Remove special SQL characters
    query = re.sub(r'[;\'\"\\]', '', query)
    # Limit length
    return query[:200]

def validate_price(price):
    """Validate price is positive number"""
    try:
        price = float(price)
        if price < 0:
            raise ValidationError('Price cannot be negative')
        return price
    except (ValueError, TypeError):
        raise ValidationError('Invalid price format')

def validate_quantity(quantity):
    """Validate quantity is positive integer"""
    try:
        quantity = int(quantity)
        if quantity < 1:
            raise ValidationError('Quantity must be at least 1')
        if quantity > 100:
            raise ValidationError('Quantity cannot exceed 100')
        return quantity
    except (ValueError, TypeError):
        raise ValidationError('Invalid quantity format')
