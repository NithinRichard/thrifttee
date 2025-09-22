from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Wishlist

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