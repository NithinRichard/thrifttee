from django.db.models import Sum, Count, Avg, Q
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import Order, OrderItem

class OrderAnalytics:
    """Analytics utilities for orders"""
    
    @staticmethod
    def get_dashboard_stats(days=30):
        """Get dashboard statistics"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        orders = Order.objects.filter(created_at__gte=start_date)
        
        total_revenue = orders.filter(payment_status='completed').aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0')
        
        total_orders = orders.count()
        completed_orders = orders.filter(payment_status='completed').count()
        pending_orders = orders.filter(payment_status='pending').count()
        
        avg_order_value = orders.filter(payment_status='completed').aggregate(
            avg=Avg('total_amount')
        )['avg'] or Decimal('0')
        
        return {
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'completed_orders': completed_orders,
            'pending_orders': pending_orders,
            'avg_order_value': float(avg_order_value),
        }
    
    @staticmethod
    def get_revenue_chart(days=30):
        """Get daily revenue data for chart"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)
        
        data = Order.objects.filter(
            created_at__gte=start_date,
            payment_status='completed'
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            revenue=Sum('total_amount'),
            orders=Count('id')
        ).order_by('date')
        
        return [{
            'date': item['date'].strftime('%Y-%m-%d'),
            'revenue': float(item['revenue']),
            'orders': item['orders']
        } for item in data]
    
    @staticmethod
    def get_top_products(limit=10):
        """Get top selling products"""
        data = OrderItem.objects.filter(
            order__payment_status='completed'
        ).values(
            'product_title', 'product_brand'
        ).annotate(
            quantity_sold=Sum('quantity'),
            revenue=Sum('price')
        ).order_by('-quantity_sold')[:limit]
        
        return [{
            'name': f"{item['product_brand']} - {item['product_title']}"[:50],
            'quantity': item['quantity_sold'],
            'revenue': float(item['revenue'])
        } for item in data]
    
    @staticmethod
    def get_order_status_distribution():
        """Get order status distribution"""
        data = Order.objects.values('status').annotate(
            count=Count('id')
        ).order_by('-count')
        
        return [{
            'status': item['status'],
            'count': item['count']
        } for item in data]
