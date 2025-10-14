from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from .models import UserProfile, Wishlist, SavedSearch
from .serializers import UserSerializer, UserProfileSerializer, WishlistSerializer, SavedSearchSerializer
from apps.common.validators import sanitize_html, validate_email

class RegisterView(generics.CreateAPIView):
    """User registration view."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        
        # Validate and sanitize email
        try:
            if data.get('email'):
                data['email'] = validate_email(data['email'])
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Sanitize text inputs
        if data.get('full_name'):
            data['full_name'] = sanitize_html(data['full_name'])
        if data.get('first_name'):
            data['first_name'] = sanitize_html(data['first_name'])
        if data.get('last_name'):
            data['last_name'] = sanitize_html(data['last_name'])
        
        # Map frontend fields to Django User fields
        if not data.get('username'):
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
        
        # Sanitize username
        if username:
            username = sanitize_html(username)

        # Attempt email-based login if username not provided
        user = None
        if not username and request.data.get('email') and password:
            try:
                email = validate_email(request.data.get('email'))
            except ValidationError:
                return Response({'error': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
            # Emails may not be unique; try all matching users in a deterministic order
            qs = User.objects.filter(email=email).order_by('-date_joined', '-id')
            for candidate in qs:
                user = authenticate(username=candidate.username, password=password)
                if user:
                    break

        # If username provided or email-based auth did not find a match, try direct username auth
        if user is None and username and password:
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

class SavedSearchesView(generics.ListAPIView):
    """List user's saved searches."""
    serializer_class = SavedSearchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedSearch.objects.filter(user=self.request.user, is_active=True)

class CreateSavedSearchView(generics.CreateAPIView):
    """Create a new saved search."""
    serializer_class = SavedSearchSerializer
    permission_classes = [AllowAny]  # Allow guest users to create saved searches

    def create(self, request, *args, **kwargs):
        # Validate and sanitize inputs
        email = request.data.get('email')
        if email:
            try:
                email = validate_email(email)
            except ValidationError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        query = sanitize_html(request.data.get('query', ''))
        filters = request.data.get('filters', {})

        if email:
            existing_search = SavedSearch.objects.filter(
                email=email,
                query=query,
                filters=filters,
                is_active=True
            ).first()

            if existing_search:
                # Return existing search instead of creating duplicate
                serializer = self.get_serializer(existing_search)
                return Response(serializer.data, status=status.HTTP_200_OK)

        # Create new saved search
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        saved_search = serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class DeleteSavedSearchView(generics.DestroyAPIView):
    """Delete a saved search."""
    permission_classes = [AllowAny]  # Allow guests to delete their own searches

    def get_queryset(self):
        # For authenticated users, only allow deleting their own searches
        if self.request.user.is_authenticated:
            return SavedSearch.objects.filter(user=self.request.user)
        # For guests, allow deletion by email (less secure but necessary for guest functionality)
        email = self.request.query_params.get('email')
        if email:
            return SavedSearch.objects.filter(email=email, user__isnull=True)
        return SavedSearch.objects.none()

    def delete(self, request, *args, **kwargs):
        saved_search = self.get_object()

        # Soft delete by marking as inactive
        saved_search.is_active = False
        saved_search.save()

        return Response({'message': 'Saved search deleted'}, status=status.HTTP_200_OK)