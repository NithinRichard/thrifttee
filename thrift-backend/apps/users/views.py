from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import UserProfile, Wishlist
from .serializers import UserSerializer, UserProfileSerializer, WishlistSerializer

class RegisterView(generics.CreateAPIView):
    """User registration view."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # Map frontend fields to Django User fields
        if not data.get('username'):
            # Use email as username fallback
            if data.get('email'):
                data['username'] = data['email']
            elif data.get('full_name'):
                data['username'] = data['full_name']
        # Populate first_name/last_name from full_name when provided
        full_name = data.get('full_name')
        if full_name and not (data.get('first_name') or data.get('last_name')):
            parts = full_name.strip().split()
            data['first_name'] = parts[0]
            if len(parts) > 1:
                data['last_name'] = ' '.join(parts[1:])

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        # Create auth token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    """User login view."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        # Allow login with email from frontend
        if not username and request.data.get('email'):
            email = request.data.get('email')
            try:
                user_obj = User.objects.get(email=email)
                username = user_obj.username
            except User.DoesNotExist:
                username = None
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'user': UserSerializer(user).data,
                    'token': token.key
                })
        
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(generics.GenericAPIView):
    """User logout view."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            request.user.auth_token.delete()
        except:
            pass
        return Response({'message': 'Logged out successfully'})

class ProfileView(generics.RetrieveAPIView):
    """User profile view."""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class UpdateProfileView(generics.UpdateAPIView):
    """Update user profile view."""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class WishlistView(generics.ListAPIView):
    """User wishlist view."""
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return (
            Wishlist.objects
            .filter(user=self.request.user)
            .select_related('tshirt', 'tshirt__brand', 'tshirt__category')
        )

class AddToWishlistView(generics.CreateAPIView):
    """Add item to wishlist."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, tshirt_id):
        from apps.products.models import TShirt
        
        try:
            tshirt = TShirt.objects.get(id=tshirt_id, is_available=True)
            wishlist_item, created = Wishlist.objects.get_or_create(
                user=request.user,
                tshirt=tshirt
            )
            serializer = WishlistSerializer(
                wishlist_item,
                context={'request': request}
            )
            status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
            return Response(serializer.data, status=status_code)
        except TShirt.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

class RemoveFromWishlistView(generics.DestroyAPIView):
    """Remove item from wishlist."""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, tshirt_id):
        try:
            wishlist_item = Wishlist.objects.get(user=request.user, tshirt_id=tshirt_id)
            wishlist_item.delete()
            return Response({'message': 'Removed from wishlist'}, status=status.HTTP_200_OK)
        except Wishlist.DoesNotExist:
            return Response({'error': 'Item not in wishlist'}, status=status.HTTP_404_NOT_FOUND)