import razorpay
from django.conf import settings
from decimal import Decimal

class RefundManager:
    """Manages refund processing via Razorpay."""
    
    def __init__(self):
        self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    
    def process_refund(self, order, amount=None):
        """Process refund for an order."""
        if not order.razorpay_payment_id:
            return {'success': False, 'error': 'No payment ID found'}
        
        try:
            refund_amount = int((amount or order.total_amount) * 100)  # Convert to paise
            
            refund = self.client.payment.refund(order.razorpay_payment_id, {
                'amount': refund_amount,
                'speed': 'normal',
                'notes': {
                    'order_id': order.order_number,
                    'reason': 'Customer request'
                }
            })
            
            order.payment_status = 'refunded'
            order.save()
            
            return {
                'success': True,
                'refund_id': refund['id'],
                'amount': refund['amount'] / 100,
                'status': refund['status']
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def check_refund_status(self, refund_id):
        """Check status of a refund."""
        try:
            refund = self.client.refund.fetch(refund_id)
            return {
                'success': True,
                'status': refund['status'],
                'amount': refund['amount'] / 100
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

refund_manager = RefundManager()
