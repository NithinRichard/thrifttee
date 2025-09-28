"""
Shiprocket API Views
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from apps.orders.models import Order
from apps.shipping.services import shiprocket_service


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_shiprocket_order(request, order_id):
    """
    Create a Shiprocket order for the given order ID
    """
    try:
        order = get_object_or_404(Order, id=order_id, user=request.user)

        if not order.shipping_address:
            return Response(
                {'error': 'Order must have a shipping address'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prepare order items
        order_items = []
        for item in order.items.all():
            order_items.append({
                'product': item.product,
                'quantity': item.quantity
            })

        # Prepare shipping address
        shipping_address = {
            'name': order.shipping_address.get('name', ''),
            'email': request.user.email,
            'phone': order.shipping_address.get('phone', ''),
            'address': order.shipping_address.get('address', ''),
            'address_2': order.shipping_address.get('address_2', ''),
            'city': order.shipping_address.get('city', ''),
            'state': order.shipping_address.get('state', ''),
            'country': order.shipping_address.get('country', 'India'),
            'postal_code': order.shipping_address.get('postal_code', '')
        }

        # Create Shiprocket order
        result = shiprocket_service.create_shipment(
            order_data={
                'order_id': str(order.id),
                'created_at': order.created_at
            },
            order_items=order_items,
            shipping_address=shipping_address
        )

        if result.get('success'):
            # Update order with Shiprocket tracking info
            order.shiprocket_order_id = result.get('shiprocket_order_id')
            order.tracking_number = result.get('tracking_number')
            order.courier_name = result.get('courier_name')
            order.awb_number = result.get('awb')
            order.estimated_delivery = result.get('estimated_delivery')
            order.save()

            return Response({
                'success': True,
                'message': 'Shiprocket order created successfully',
                'tracking_number': result.get('tracking_number'),
                'courier_name': result.get('courier_name'),
                'awb': result.get('awb'),
                'estimated_delivery': result.get('estimated_delivery')
            })
        else:
            return Response(
                {'error': result.get('error', 'Failed to create Shiprocket order')},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def track_shiprocket_order(request, order_id):
    """
    Track Shiprocket order status
    """
    try:
        order = get_object_or_404(Order, id=order_id, user=request.user)

        if not order.shiprocket_order_id:
            return Response(
                {'error': 'Order not shipped via Shiprocket'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Track shipment
        result = shiprocket_service.track_shipment(order.shiprocket_order_id)

        if 'error' not in result:
            return Response({
                'success': True,
                'current_status': result.get('current_status'),
                'tracking_id': result.get('tracking_id'),
                'courier_name': result.get('courier_name'),
                'estimated_delivery': result.get('etd'),
                'actual_delivery': result.get('edd'),
                'tracking_url': result.get('tracking_url')
            })
        else:
            return Response(
                {'error': result.get('error')},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_shiprocket_shipping(request):
    """
    Calculate shipping cost using Shiprocket API
    """
    try:
        # Get cart items from request
        cart_items = request.data.get('cart_items', [])
        shipping_address = request.data.get('shipping_address', {})

        if not cart_items or not shipping_address:
            return Response(
                {'error': 'Cart items and shipping address are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate shipping using Shiprocket
        result = shiprocket_service.calculate_shipping_rate(
            cart_items,
            shipping_address
        )

        if 'error' not in result:
            return Response({
                'success': True,
                'shipping_cost': result.get('shipping_cost'),
                'method': result.get('method'),
                'estimated_days': result.get('estimated_days'),
                'zone': result.get('zone'),
                'breakdown': result.get('breakdown'),
                'shiprocket_data': result.get('shiprocket_data')
            })
        else:
            return Response(
                {'error': result.get('error')},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def shiprocket_webhook(request):
    """
    Handle Shiprocket webhook notifications
    """
    try:
        # Verify webhook signature if provided
        signature = request.headers.get('X-Shiprocket-Signature', '')
        expected_signature = getattr(settings, 'SHIPROCKET_WEBHOOK_SECRET', '')

        if expected_signature and signature != expected_signature:
            return Response(
                {'error': 'Invalid webhook signature'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        webhook_data = request.data

        # Process webhook based on event type
        event_type = webhook_data.get('event_type')
        order_id = webhook_data.get('order_id')

        if event_type and order_id:
            # Update order status based on Shiprocket event
            try:
                order = Order.objects.get(shiprocket_order_id=order_id)
                order.status = _map_shiprocket_status_to_order_status(event_type)
                order.save()

                return Response({'success': True, 'message': 'Order status updated'})

            except Order.DoesNotExist:
                return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'error': 'Invalid webhook data'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _map_shiprocket_status_to_order_status(shiprocket_status):
    """Map Shiprocket status to internal order status"""
    status_mapping = {
        'order_created': 'processing',
        'order_shipped': 'shipped',
        'out_for_delivery': 'out_for_delivery',
        'delivered': 'delivered',
        'cancelled': 'cancelled',
        'return_requested': 'return_requested',
        'returned': 'returned'
    }

    return status_mapping.get(shiprocket_status, 'processing')
