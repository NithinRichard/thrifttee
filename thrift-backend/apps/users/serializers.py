from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Wishlist, SavedSearch

class UserSerializer(serializers.ModelSerializer):
    """User serializer."""
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer."""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'user', 'phone', 'date_of_birth', 'address_line1', 'address_line2',
            'city', 'state', 'postal_code', 'country', 'newsletter_subscription',
            'size_preference', 'created_at', 'updated_at'
        ]

class WishlistSerializer(serializers.ModelSerializer):
    """Wishlist serializer."""
    from apps.products.serializers import TShirtListSerializer
    tshirt = TShirtListSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'tshirt', 'created_at']

class SavedSearchSerializer(serializers.ModelSerializer):
    """Saved search serializer."""
    user = UserSerializer(read_only=True)

    class Meta:
        model = SavedSearch
        fields = [
            'id', 'user', 'email', 'query', 'filters', 'is_active',
            'notification_sent', 'source', 'created_at', 'updated_at', 'last_notified_at'
        ]
        read_only_fields = ['id', 'user', 'notification_sent', 'created_at', 'updated_at', 'last_notified_at']

    def create(self, validated_data):
        # Get request context for user and metadata
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user

        # Add metadata if available
        if request:
            validated_data['ip_address'] = self.get_client_ip(request)
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')

        return super().create(validated_data)

    def get_client_ip(self, request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip