from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Order, OrderItem, ReturnRequest
from .serializers import OrderSerializer
from apps.products.models import TShirt
from apps.products.serializers import TShirtListSerializer, TShirtDetailSerializer
from django.utils.text import slugify
from .refunds import refund_manager
from .analytics import OrderAnalytics
import csv
from django.http import HttpResponse

class AdminOrderViewSet(viewsets.ModelViewSet):
    """Admin-only order management."""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update order status."""
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=400)
        
        order.status = new_status
        if new_status == 'shipped':
            order.shipped_at = timezone.now()
        elif new_status == 'delivered':
            order.delivered_at = timezone.now()
        order.save()
        
        return Response({'status': 'updated'})
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get comprehensive analytics."""
        days = int(request.query_params.get('days', 30))
        
        stats = OrderAnalytics.get_dashboard_stats(days)
        revenue_chart = OrderAnalytics.get_revenue_chart(days)
        top_products = OrderAnalytics.get_top_products()
        status_dist = OrderAnalytics.get_order_status_distribution()
        
        return Response({
            'stats': stats,
            'revenue_chart': revenue_chart,
            'top_products': top_products,
            'status_distribution': status_dist
        })
    
    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        """Bulk update order status."""
        order_ids = request.data.get('order_ids', [])
        new_status = request.data.get('status')
        
        if not order_ids or not new_status:
            return Response({'error': 'order_ids and status required'}, status=400)
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=400)
        
        updated = Order.objects.filter(id__in=order_ids).update(status=new_status)
        return Response({'updated': updated})
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export orders to CSV."""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="orders.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Order Number', 'Customer', 'Email', 'Total', 'Status', 'Payment Status', 'Date'])
        
        orders = self.get_queryset()
        for order in orders:
            writer.writerow([
                order.order_number,
                order.shipping_name,
                order.shipping_email,
                order.total_amount,
                order.status,
                order.payment_status,
                order.created_at.strftime('%Y-%m-%d %H:%M')
            ])
        
        return response

class AdminProductViewSet(viewsets.ModelViewSet):
    """Admin-only product management."""
    queryset = TShirt.objects.all()
    serializer_class = TShirtListSerializer
    permission_classes = [IsAdminUser]
    
    def create(self, request, *args, **kwargs):
        """Create new product."""
        data = request.data.copy()
        
        # Generate slug from title
        if 'title' in data and not data.get('slug'):
            data['slug'] = slugify(data['title'])
        
        serializer = TShirtDetailSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        """Update product stock."""
        product = self.get_object()
        quantity = request.data.get('quantity')
        
        if quantity is None:
            return Response({'error': 'Quantity required'}, status=400)
        
        product.quantity = int(quantity)
        product.is_available = product.quantity > 0
        product.save()
        
        return Response({'status': 'updated', 'quantity': product.quantity})

class AdminReturnViewSet(viewsets.ModelViewSet):
    """Admin-only return request management."""
    queryset = ReturnRequest.objects.all()
    permission_classes = [IsAdminUser]
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve return request."""
        return_request = self.get_object()
        return_request.status = 'approved'
        return_request.save()
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject return request."""
        return_request = self.get_object()
        return_request.status = 'rejected'
        return_request.save()
        return Response({'status': 'rejected'})
    
    @action(detail=True, methods=['post'])
    def process_refund(self, request, pk=None):
        """Process refund for approved return."""
        return_request = self.get_object()
        if return_request.status != 'approved':
            return Response({'error': 'Return must be approved first'}, status=400)
        
        result = refund_manager.process_refund(return_request.order)
        if result['success']:
            return_request.status = 'completed'
            return_request.save()
            return Response(result)
        return Response(result, status=400)
