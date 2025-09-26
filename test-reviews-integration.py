#!/usr/bin/env python3
"""
Test script to verify the vintage reviews system integration
"""

import os
import sys
import django

# Add the Django project to the path
sys.path.append('thrift-backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')

django.setup()

from apps.products.models import TShirt, TShirtReview
from django.contrib.auth.models import User

def test_reviews_system():
    print("Testing Vintage Reviews System Integration...")
    
    # Check if we have products
    products = TShirt.objects.filter(is_available=True)[:3]
    print(f"Found {products.count()} available products")
    
    if not products:
        print("No products found. Please create some products first.")
        return
    
    # Check if we have users
    users = User.objects.all()[:2]
    print(f"Found {users.count()} users")
    
    if not users:
        print("No users found. Creating test user...")
        user = User.objects.create_user(
            username='testreviewer',
            email='test@example.com',
            password='testpass123'
        )
        users = [user]
    
    # Create sample reviews
    product = products[0]
    user = users[0]
    
    # Check if review already exists
    existing_review = TShirtReview.objects.filter(tshirt=product, user=user).first()
    
    if not existing_review:
        review = TShirtReview.objects.create(
            tshirt=product,
            user=user,
            rating=5,
            title="Amazing vintage find!",
            comment="This t-shirt exceeded my expectations. The condition was exactly as described and the quality is fantastic. Perfect fit and the vintage feel is authentic.",
            is_verified_purchase=True
        )
        print(f"Created sample review: {review}")
    else:
        print(f"Review already exists: {existing_review}")
    
    # Test review properties
    reviews = TShirtReview.objects.filter(tshirt=product)
    for review in reviews:
        print(f"Review by {review.reviewer_initials}: {review.rating}/5 stars")
        print(f"Posted {review.days_since_review} days ago")
        print(f"Title: {review.title}")
        print("---")
    
    print("✅ Reviews system integration test completed!")

if __name__ == "__main__":
    test_reviews_system()