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
            'primary_image', 'is_featured', 'created_at'
        ]

class TShirtDetailSerializer(serializers.ModelSerializer):
    """Serializer for T-Shirt detail view (full data)."""
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    all_images = serializers.SerializerMethodField()
    discount_percentage = serializers.ReadOnlyField()
    reviews_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = TShirt
        fields = [
            'id', 'title', 'slug', 'description', 'brand', 'category',
            'size', 'color', 'material', 'gender', 'condition', 'price',
            'original_price', 'discount_percentage', 'quantity', 'is_available',
            'is_featured', 'meta_description', 'tags', 'all_images',
            'reviews_count', 'average_rating', 'created_at', 'updated_at'
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
