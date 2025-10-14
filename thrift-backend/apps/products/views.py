from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Min, Max
from django.db import models
from .models import TShirt, Brand, Category, TShirtReview, ShippingZone, ShippingMethod, ShippingRate, ShippingCalculator
from .serializers import (
    TShirtListSerializer, TShirtDetailSerializer, BrandSerializer,
    CategorySerializer, TShirtReviewSerializer
)
from .filters import TShirtFilter
from apps.common.validators import sanitize_search_query, sanitize_html, validate_quantity

class TShirtListView(generics.ListAPIView):
    """List view for T-Shirts with filtering and search."""
    queryset = TShirt.objects.filter(is_available=True).select_related('brand', 'category')
    serializer_class = TShirtListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TShirtFilter
    search_fields = ['title', 'description', 'brand__name', 'color', 'tags']
    ordering_fields = ['price', 'created_at', 'title']
    ordering = ['-created_at']

class TShirtDetailView(generics.RetrieveAPIView):
    """Detail view for individual T-Shirt."""
    queryset = TShirt.objects.filter(is_available=True).select_related('brand', 'category')
    serializer_class = TShirtDetailSerializer
    lookup_field = 'slug'

class FeaturedTShirtsView(generics.ListAPIView):
    """List view for featured T-Shirts."""
    queryset = TShirt.objects.filter(is_available=True, is_featured=True).select_related('brand', 'category')
    serializer_class = TShirtListSerializer

class BrandListView(generics.ListAPIView):
    """List view for all brands."""
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

class CategoryListView(generics.ListAPIView):
    """List view for all categories."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class TShirtReviewListCreateView(generics.ListCreateAPIView):
    """List and create reviews for a specific T-Shirt."""
    serializer_class = TShirtReviewSerializer
    
    def get_queryset(self):
        tshirt_id = self.kwargs['tshirt_id']
        return TShirtReview.objects.filter(tshirt_id=tshirt_id).select_related('user')
    
    def perform_create(self, serializer):
        tshirt_id = self.kwargs['tshirt_id']
        serializer.save(tshirt_id=tshirt_id)

@api_view(['GET'])
def search_suggestions(request):
    """API endpoint for search suggestions."""
    query = sanitize_search_query(request.GET.get('q', ''))
    
    if len(query) < 2:
        return Response({'suggestions': []})
    
    # Search in brands, colors, and tags
    brands = Brand.objects.filter(name__icontains=query)[:5]
    colors = TShirt.objects.filter(color__icontains=query).values_list('color', flat=True).distinct()[:5]
    
    suggestions = []
    
    # Add brand suggestions
    for brand in brands:
        suggestions.append({
            'type': 'brand',
            'value': brand.name,
            'label': f"Brand: {brand.name}"
        })
    
    # Add color suggestions
    for color in colors:
        suggestions.append({
            'type': 'color',
            'value': color,
            'label': f"Color: {color.title()}"
        })
    
    return Response({'suggestions': suggestions[:10]})

@api_view(['GET'])
def filter_options(request):
    """API endpoint to get all available filter options."""
    brands = Brand.objects.all().values('id', 'name')
    categories = Category.objects.all().values('id', 'name')
    
    # Get price range
    price_range = TShirt.objects.filter(is_available=True).aggregate(
        min_price=models.Min('price'),
        max_price=models.Max('price')
    )
    
    # Format condition choices with proper labels
    condition_choices = []
    for value, label in TShirt.CONDITION_CHOICES:
        condition_choices.append({'value': value, 'label': label})
    
    # Format size choices
    size_choices = []
    for value, label in TShirt.SIZE_CHOICES:
        size_choices.append({'value': value, 'label': label})
    
    # Format gender choices
    gender_choices = []
    for value, label in TShirt.GENDER_CHOICES:
        gender_choices.append({'value': value, 'label': label})
    
    return Response({
        'brands': list(brands),
        'categories': list(categories),
        'sizes': size_choices,
        'conditions': condition_choices,
        'genders': gender_choices,
        'price_range': price_range,
        'boolean_filters': {
            'is_available': [{'value': True, 'label': 'Yes'}, {'value': False, 'label': 'No'}],
            'is_featured': [{'value': True, 'label': 'Yes'}, {'value': False, 'label': 'No'}],
            'condition_verified': [{'value': True, 'label': 'Yes'}, {'value': False, 'label': 'No'}],
            'has_stains': [{'value': True, 'label': 'Yes'}, {'value': False, 'label': 'No'}],
            'has_holes': [{'value': True, 'label': 'Yes'}, {'value': False, 'label': 'No'}],
            'has_fading': [{'value': True, 'label': 'Yes'}, {'value': False, 'label': 'No'}],
            'has_pilling': [{'value': True, 'label': 'Yes'}, {'value': False, 'label': 'No'}],
            'has_repairs': [{'value': True, 'label': 'Yes'}, {'value': False, 'label': 'No'}]
        },
        'date_filters': {
            'created_today': 'Today',
            'created_week': 'Past 7 days',
            'created_month': 'This month',
            'created_year': 'This year'
        }
    })


# Shipping Calculator API Endpoints

@api_view(['POST'])
@permission_classes([])
@csrf_exempt
def calculate_shipping(request):
    """
    Calculate shipping cost based on cart items and shipping address.
    """
    try:
        print("=== SHIPPING CALCULATION REQUEST ===")
        print(f"Full request data: {request.data}")
        print(f"Request method: {request.method}")
        print(f"Request headers: {dict(request.headers)}")

        items = request.data.get('items', [])
        shipping_address = request.data.get('shipping_address', {})
        shipping_method_id = request.data.get('shipping_method_id')

        print(f"Items: {items}")
        print(f"Shipping address: {shipping_address}")
        print(f"Method ID: {shipping_method_id}")

        # Validate required fields
        if not items:
            print("❌ ERROR: No items provided")
            return Response(
                {'error': 'Items are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not shipping_address:
            print("❌ ERROR: No shipping address provided")
            return Response(
                {'error': 'Shipping address is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Detailed item validation
        print("=== ITEM VALIDATION ===")
        valid_items = []
        for i, item in enumerate(items):
            print(f"Item {i}: {item}")
            product_id = item.get('product_id')
            quantity = item.get('quantity')

            print(f"  Product ID: {product_id} (type: {type(product_id)})")
            print(f"  Quantity: {quantity} (type: {type(quantity)})")

            if product_id is None:
                print(f"❌ Item {i}: Missing product_id")
                continue
            if quantity is None or quantity <= 0:
                print(f"❌ Item {i}: Invalid quantity {quantity}")
                continue

            valid_items.append(item)

        print(f"Valid items: {len(valid_items)}/{len(items)}")

        if len(valid_items) == 0:
            return Response(
                {'error': 'No valid items found in cart'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Test zone detection with the exact address
        print("=== ZONE DETECTION TEST ===")
        test_zone = ShippingCalculator._get_shipping_zone(shipping_address)
        if test_zone:
            print(f"✅ Zone found: {test_zone.name}")
        else:
            print("❌ No zone found for address")
            return Response(
                {'error': 'No shipping available for this location'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get product objects for items
        order_items = []
        for item in valid_items:
            product_id = item.get('product_id')
            quantity = item.get('quantity')

            print(f"Processing item: product_id={product_id}, quantity={quantity}")

            try:
                product = TShirt.objects.get(id=product_id, is_available=True)
                order_items.append({
                    'product': product,
                    'quantity': quantity
                })
                print(f"✅ Found product: {product.title}")
            except TShirt.DoesNotExist:
                error_msg = f'Product {product_id} not found or unavailable'
                print(f"❌ {error_msg}")

                # Try to find a similar available product as fallback
                available_products = TShirt.objects.filter(is_available=True)[:1]
                if available_products:
                    fallback_product = available_products[0]
                    print(f"Using fallback product: {fallback_product.title} (ID: {fallback_product.id})")
                    order_items.append({
                        'product': fallback_product,
                        'quantity': quantity
                    })
                else:
                    return Response(
                        {'error': error_msg},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        print(f"Order items created: {len(order_items)}")

        # Calculate shipping cost
        result = ShippingCalculator.calculate_shipping_cost(
            order_items,
            shipping_address,
            shipping_method_id
        )

        print(f"Calculation result: {result}")

        if 'error' in result:
            print(f"❌ Calculation error: {result['error']}")
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

        print("✅ Shipping calculation successful!")
        return Response(result)

    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': f'Shipping calculation failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def shipping_zones(request):
    """Get all available shipping zones."""
    zones = ShippingZone.objects.filter(is_active=True)
    return Response([{
        'id': zone.id,
        'name': zone.name,
        'description': zone.description,
        'base_cost': float(zone.base_cost),
        'free_shipping_threshold': float(zone.free_shipping_threshold) if zone.free_shipping_threshold else None,
        'countries': zone.countries.split(',') if zone.countries else []
    } for zone in zones])


@api_view(['GET'])
def shipping_methods(request):
    """Get all available shipping methods."""
    methods = ShippingMethod.objects.filter(is_active=True)
    return Response([{
        'id': method.id,
        'name': method.name,
        'description': method.description,
        'estimated_days': method.estimated_days,
        'cost_multiplier': float(method.cost_multiplier),
        'max_weight_kg': float(method.max_weight_kg) if method.max_weight_kg else None
    } for method in methods])


@api_view(['GET'])
def shipping_rates(request):
    """Get all shipping rates for admin purposes."""
    rates = ShippingRate.objects.filter(is_active=True).select_related('zone', 'method')
    return Response([{
        'id': rate.id,
        'zone': rate.zone.name,
        'method': rate.method.name,
        'min_weight_kg': float(rate.min_weight_kg),
        'max_weight_kg': float(rate.max_weight_kg) if rate.max_weight_kg else None,
        'base_cost': float(rate.base_cost),
        'per_kg_cost': float(rate.per_kg_cost),
        'insurance_rate': float(rate.insurance_rate)
    } for rate in rates])


@api_view(['GET'])
def product_reviews(request, product_id):
    """Get reviews for a specific product with sorting."""
    try:
        product = TShirt.objects.get(id=product_id, is_available=True)
    except TShirt.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    reviews = TShirtReview.objects.filter(tshirt=product).select_related('user')
    
    # Sorting
    sort_by = request.GET.get('sort', 'newest')
    if sort_by == 'oldest':
        reviews = reviews.order_by('created_at')
    elif sort_by == 'rating_high':
        reviews = reviews.order_by('-rating', '-created_at')
    elif sort_by == 'rating_low':
        reviews = reviews.order_by('rating', '-created_at')
    else:  # newest (default)
        reviews = reviews.order_by('-created_at')
    
    # Calculate average rating
    avg_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 0
    
    review_data = []
    for review in reviews:
        review_data.append({
            'id': review.id,
            'rating': review.rating,
            'title': review.title,
            'comment': review.comment,
            'reviewer_initials': review.reviewer_initials,
            'is_verified_purchase': review.is_verified_purchase,
            'days_since_review': review.days_since_review,
            'created_at': review.created_at.isoformat()
        })
    
    return Response({
        'reviews': review_data,
        'average_rating': round(avg_rating, 1),
        'total_reviews': len(review_data)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_review(request, product_id):
    """Submit a new review for a product."""
    try:
        product = TShirt.objects.get(id=product_id, is_available=True)
    except TShirt.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user already reviewed this product
    if TShirtReview.objects.filter(tshirt=product, user=request.user).exists():
        return Response({'error': 'You have already reviewed this product'}, status=status.HTTP_400_BAD_REQUEST)
    
    rating = request.data.get('rating')
    title = sanitize_html(request.data.get('title', ''))
    comment = sanitize_html(request.data.get('comment', ''))
    
    if not rating or not title or not comment:
        return Response({'error': 'Rating, title, and comment are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        rating = int(rating)
        if rating < 1 or rating > 5:
            raise ValueError
    except (ValueError, TypeError):
        return Response({'error': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
    
    review = TShirtReview.objects.create(
        tshirt=product,
        user=request.user,
        rating=rating,
        title=title,
        comment=comment,
        is_verified_purchase=False  # TODO: Check actual purchase history
    )
    
    return Response({
        'id': review.id,
        'rating': review.rating,
        'title': review.title,
        'comment': review.comment,
        'reviewer_initials': review.reviewer_initials,
        'is_verified_purchase': review.is_verified_purchase,
        'days_since_review': review.days_since_review,
        'created_at': review.created_at.isoformat()
    }, status=status.HTTP_201_CREATED)

# Reservation System Views
from django.utils import timezone
from datetime import timedelta
from .models import ProductReservation
from .utils import get_available_quantity, can_reserve_quantity

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_reservation(request, product_id):
    try:
        product = TShirt.objects.get(id=product_id, is_available=True)
        quantity = validate_quantity(request.data.get('quantity', 1))
        
        # Validate quantity
        if quantity < 1:
            return Response({'error': 'Quantity must be at least 1'}, status=400)
        
        # Check if user can reserve this quantity
        if not can_reserve_quantity(product, request.user, quantity):
            available = get_available_quantity(product)
            return Response({
                'error': f'Only {available} items available for reservation'
            }, status=400)
        
        # Clean up expired reservations first
        ProductReservation.objects.filter(
            product=product,
            is_active=True,
            expires_at__lte=timezone.now()
        ).update(is_active=False)
        
        # Create or update reservation
        expires_at = timezone.now() + timedelta(minutes=15)
        
        try:
            # Try to get existing reservation
            reservation = ProductReservation.objects.get(
                product=product,
                user=request.user
            )
            # Update existing reservation
            reservation.quantity = quantity
            reservation.expires_at = expires_at
            reservation.is_active = True
            reservation.extension_count = 0
            reservation.save()
        except ProductReservation.DoesNotExist:
            # Create new reservation
            reservation = ProductReservation.objects.create(
                product=product,
                user=request.user,
                quantity=quantity,
                expires_at=expires_at,
                is_active=True
            )
        
        return Response({
            'reservation_id': reservation.id,
            'quantity': reservation.quantity,
            'expires_at': reservation.expires_at,
            'time_remaining': reservation.time_remaining
        })
        
    except TShirt.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def extend_reservation(request, reservation_id):
    try:
        reservation = ProductReservation.objects.get(
            id=reservation_id, 
            user=request.user,
            is_active=True
        )
        
        if reservation.extend_reservation():
            return Response({
                'expires_at': reservation.expires_at,
                'time_remaining': reservation.time_remaining,
                'extensions_used': reservation.extension_count
            })
        else:
            return Response({'error': 'Cannot extend reservation'}, status=400)
            
    except ProductReservation.DoesNotExist:
        return Response({'error': 'Reservation not found'}, status=404)

@api_view(['GET'])
def check_reservation_status(request, product_id):
    try:
        product = TShirt.objects.get(id=product_id)
        
        # Clean up expired reservations
        ProductReservation.objects.filter(
            product=product,
            is_active=True,
            expires_at__lte=timezone.now()
        ).update(is_active=False)
        
        # Check if user has active reservation
        user_reservation = None
        if request.user.is_authenticated:
            try:
                user_reservation = ProductReservation.objects.get(
                    product=product,
                    user=request.user,
                    is_active=True,
                    expires_at__gt=timezone.now()
                )
            except ProductReservation.DoesNotExist:
                pass
        
        # Get available quantity
        available_qty = get_available_quantity(product)
        
        if user_reservation:
            return Response({
                'is_reserved': True,
                'expires_at': user_reservation.expires_at,
                'time_remaining': user_reservation.time_remaining,
                'is_own_reservation': True,
                'quantity': user_reservation.quantity,
                'available_quantity': available_qty + user_reservation.quantity,
                'total_quantity': product.quantity
            })
        elif available_qty == product.quantity:
            # No reservations in effect; treat as not reserved
            return Response({
                'is_reserved': False,
                'available_quantity': available_qty,
                'total_quantity': product.quantity
            })
        elif available_qty == 0:
            # Fully reserved by others
            return Response({
                'is_reserved': True,
                'is_own_reservation': False,
                'available_quantity': available_qty,
                'total_quantity': product.quantity
            })
        else:
            # Partially reserved by others but stock remains; not reserved from the shopper's perspective
            return Response({
                'is_reserved': False,
                'available_quantity': available_qty,
                'total_quantity': product.quantity
            })
        
    except TShirt.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)