from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    
    # Profile endpoints
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/update/', views.UpdateProfileView.as_view(), name='update-profile'),
    
    # Wishlist endpoints
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    path('wishlist/add/<int:tshirt_id>/', views.AddToWishlistView.as_view(), name='add-to-wishlist'),
    path('wishlist/remove/<int:tshirt_id>/', views.RemoveFromWishlistView.as_view(), name='remove-from-wishlist'),
    
    # Saved search endpoints
    path('saved_searches/', views.SavedSearchesView.as_view(), name='saved-searches'),
    path('saved_searches/create/', views.CreateSavedSearchView.as_view(), name='create-saved-search'),
    path('saved_searches/<int:pk>/delete/', views.DeleteSavedSearchView.as_view(), name='delete-saved-search'),
]