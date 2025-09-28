from rest_framework import serializers
from .models import TShirt, Brand, Category, TShirtReview

class BrandSerializer(serializers.ModelSerializer):
    """Serializer for Brand model."""
    
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'description']

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']

class TShirtListSerializer(serializers.ModelSerializer):
    """Serializer for T-Shirt list view (minimal data)."""
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = TShirt
        fields = [
            'id', 'title', 'slug', 'brand', 'category', 'size', 'color',
            'condition', 'price', 'original_price', 'discount_percentage',
            'primary_image', 'is_featured', 'quantity', 'is_available', 'created_at'
        ]

class TShirtDetailSerializer(serializers.ModelSerializer):
    """Serializer for T-Shirt detail view (full data)."""
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    all_images = serializers.SerializerMethodField()
    condition_photos = serializers.SerializerMethodField()
    discount_percentage = serializers.ReadOnlyField()
    reviews_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    has_detailed_condition_info = serializers.ReadOnlyField()
    condition_badge_class = serializers.ReadOnlyField()
    
    class Meta:
        model = TShirt
        fields = [
            'id', 'title', 'slug', 'description', 'brand', 'category',
            'size', 'color', 'material', 'gender', 'condition', 'price',
            'original_price', 'discount_percentage', 'quantity', 'is_available',
            'is_featured', 'meta_description', 'tags', 'all_images', 'condition_photos',
            'reviews_count', 'average_rating', 'has_detailed_condition_info',
            'condition_badge_class', 'created_at', 'updated_at',
            # Enhanced Condition Fields
            'condition_notes', 'has_stains', 'has_holes', 'has_fading',
            'has_pilling', 'has_repairs', 'condition_confidence',
            'pit_to_pit', 'shoulder_to_shoulder', 'front_length', 'back_length',
            'sleeve_length', 'weight_grams', 'condition_verified',
            'condition_verifier', 'condition_verified_at'
        ]
    
    def get_reviews_count(self, obj):
        return obj.reviews.count()
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return round(sum(review.rating for review in reviews) / len(reviews), 1)
        return 0

    def get_all_images(self, obj):
        request = self.context.get('request')
        image_fields = [obj.primary_image, obj.image_2, obj.image_3, obj.image_4]
        # Add condition photos
        condition_photos = [obj.condition_photo_1, obj.condition_photo_2, obj.condition_photo_3, obj.condition_photo_4]
        image_fields.extend([img for img in condition_photos if img])
        
        urls = []
        for img in image_fields:
            if img:
                try:
                    url = img.url
                    if request is not None:
                        url = request.build_absolute_uri(url)
                    urls.append(url)
                except Exception:
                    continue
        return urls

    def get_condition_photos(self, obj):
        """Return condition-specific photos with descriptions."""
        request = self.context.get('request')
        photos = []
        photo_data = [
            (obj.condition_photo_1, 'Close-up of any flaws/damage'),
            (obj.condition_photo_2, 'Care tag/label'),
            (obj.condition_photo_3, 'Material/fabric close-up'),
            (obj.condition_photo_4, 'Additional detail photo')
        ]
        
        for img, description in photo_data:
            if img:
                try:
                    url = img.url
                    if request is not None:
                        url = request.build_absolute_uri(url)
                    photos.append({
                        'url': url,
                        'description': description
                    })
                except Exception:
                    continue
        return photos

class TShirtReviewSerializer(serializers.ModelSerializer):
    """Serializer for T-Shirt reviews."""
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = TShirtReview
        fields = [
            'id', 'user', 'rating', 'title', 'comment',
            'is_verified_purchase', 'created_at'
        ]
        read_only_fields = ['user', 'is_verified_purchase']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
