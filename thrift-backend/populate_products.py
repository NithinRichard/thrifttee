#!/usr/bin/env python
"""
Product Population Script for ThriftTees
Run this script to add 10 sample products to the database.

Usage:
    python populate_products.py
    OR
    python manage.py shell -c "exec(open('populate_products.py').read())"
"""

import os
import sys
import django
from decimal import Decimal
import random

from django.utils.text import slugify
from django.db import transaction

# Add the project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

# Setup Django with correct settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
django.setup()

from apps.products.models import TShirt, Brand, Category, ShippingZone, ShippingMethod, ShippingRate

def populate_products():
    """Add 10 sample products to the database."""

    print("🎯 ThriftTees Product Population Script")
    brands_data = [
        {'name': 'Nike', 'slug': 'nike'},
        {'name': 'Adidas', 'slug': 'adidas'},
        {'name': 'Puma', 'slug': 'puma'},
        {'name': 'Reebok', 'slug': 'reebok'},
        {'name': 'Levi\'s', 'slug': 'levis'},
        {'name': 'H&M', 'slug': 'hm'},
        {'name': 'Zara', 'slug': 'zara'},
        {'name': 'Uniqlo', 'slug': 'uniqlo'},
        {'name': 'Gap', 'slug': 'gap'},
        {'name': 'Forever 21', 'slug': 'forever21'},
    ]

    categories_data = [
        {'name': 'Sports Tees', 'slug': 'sports-tees'},
        {'name': 'Band Tees', 'slug': 'band-tees'},
        {'name': 'Vintage Tees', 'slug': 'vintage-tees'},
        {'name': 'Designer Tees', 'slug': 'designer-tees'},
        {'name': 'Basic Tees', 'slug': 'basic-tees'},
    ]

    products_data = [
        {
            'title': 'Vintage Rolling Stones Tour Tee',
            'price': 1500,
            'quantity': 1,
            'is_available': True,
            'condition': 'very_good',
            'size': 'L',
            'color': 'Black',
            'description': 'Authentic Rolling Stones 1989 Steel Wheels Tour tee. Excellent vintage condition.',
            'brand_name': 'H&M',
            'category_name': 'Band Tees'
        },
        {
            'title': 'Nike Just Do It Vintage Tee',
            'price': 899,
            'quantity': 3,
            'is_available': True,
            'condition': 'excellent',
            'size': 'M',
            'color': 'White',
            'description': 'Classic Nike Just Do It slogan tee from the 90s. Minimal wear.',
            'brand_name': 'Nike',
            'category_name': 'Sports Tees'
        },
        {
            'title': 'Adidas Originals Trefoil Tee',
            'price': 750,
            'quantity': 0,
            'is_available': False,
            'condition': 'good',
            'size': 'XL',
            'color': 'Navy',
            'description': 'Adidas Originals trefoil logo tee. Has some fading but very wearable.',
            'brand_name': 'Adidas',
            'category_name': 'Sports Tees'
        },
        {
            'title': 'Vintage Coca-Cola Classic Tee',
            'price': 1200,
            'quantity': 2,
            'is_available': True,
            'condition': 'very_good',
            'size': 'L',
            'color': 'Red',
            'description': 'Classic Coca-Cola logo tee from the 80s. Great collector item.',
            'brand_name': 'Zara',
            'category_name': 'Vintage Tees'
        },
        {
            'title': 'Levi\'s Premium Denim Tee',
            'price': 1100,
            'quantity': 4,
            'is_available': True,
            'condition': 'excellent',
            'size': 'M',
            'color': 'Blue',
            'description': 'Levi\'s premium quality denim-inspired graphic tee. Like new condition.',
            'brand_name': 'Levi\'s',
            'category_name': 'Designer Tees'
        },
        {
            'title': 'Puma Sports Performance Tee',
            'price': 650,
            'quantity': 1,
            'is_available': True,
            'condition': 'fair',
            'size': 'S',
            'color': 'Gray',
            'description': 'Puma athletic performance tee. Shows some wear but still functional.',
            'brand_name': 'Puma',
            'category_name': 'Sports Tees'
        },
        {
            'title': 'Vintage MTV Logo Tee',
            'price': 1350,
            'quantity': 0,
            'is_available': False,
            'condition': 'poor',
            'size': 'L',
            'color': 'Black',
            'description': 'Classic MTV logo tee from the 90s. Has holes and heavy wear.',
            'brand_name': 'Uniqlo',
            'category_name': 'Vintage Tees'
        },
        {
            'title': 'Gap Essential Crew Neck',
            'price': 499,
            'quantity': 6,
            'is_available': True,
            'condition': 'excellent',
            'size': 'M',
            'color': 'White',
            'description': 'Gap essential crew neck tee. Perfect basic wardrobe item.',
            'brand_name': 'Gap',
            'category_name': 'Basic Tees'
        },
        {
            'title': 'Reebok Classic Vector Tee',
            'price': 799,
            'quantity': 2,
            'is_available': True,
            'condition': 'very_good',
            'size': 'L',
            'color': 'White',
            'description': 'Reebok classic vector logo tee. Clean and well-maintained.',
            'brand_name': 'Reebok',
            'category_name': 'Sports Tees'
        },
        {
            'title': 'Forever 21 Graphic Print Tee',
            'price': 599,
            'quantity': 3,
            'is_available': True,
            'condition': 'good',
            'size': 'S',
            'color': 'Pink',
            'description': 'Forever 21 trendy graphic print tee. Some minor pilling.',
            'brand_name': 'Forever 21',
            'category_name': 'Basic Tees'
        }
    ]

    print("📦 Creating/Updating Brands and Categories...")

    # Create or get brands
    brands = {}
    for brand_data in brands_data:
        brand, created = Brand.objects.get_or_create(
            slug=brand_data['slug'],
            defaults=brand_data
        )
        brands[brand_data['name']] = brand
        status = "✅ Created" if created else "📝 Updated"
        print(f"{status}: {brand.name}")

    # Create or get categories
    categories = {}
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        categories[cat_data['name']] = category
        status = "✅ Created" if created else "📝 Updated"
        print(f"{status}: {category.name}")

def populate_products():
    """Add 10 sample products to the database."""

    print("🎯 ThriftTees Product Population Script")
    print("=" * 50)

    # Sample data
    brands_data = [
        {'name': 'Nike', 'slug': 'nike'},
        {'name': 'Adidas', 'slug': 'adidas'},
        {'name': 'Puma', 'slug': 'puma'},
        {'name': 'Reebok', 'slug': 'reebok'},
        {'name': 'Levi\'s', 'slug': 'levis'},
        {'name': 'H&M', 'slug': 'hm'},
        {'name': 'Zara', 'slug': 'zara'},
        {'name': 'Uniqlo', 'slug': 'uniqlo'},
        {'name': 'Gap', 'slug': 'gap'},
        {'name': 'Forever 21', 'slug': 'forever21'},
    ]

    categories_data = [
        {'name': 'Sports Tees', 'slug': 'sports-tees'},
        {'name': 'Band Tees', 'slug': 'band-tees'},
        {'name': 'Vintage Tees', 'slug': 'vintage-tees'},
        {'name': 'Designer Tees', 'slug': 'designer-tees'},
        {'name': 'Basic Tees', 'slug': 'basic-tees'},
    ]

    products_data = [
        {
            'title': 'Vintage Rolling Stones Tour Tee',
            'price': 1500,
            'quantity': 1,
            'is_available': True,
            'condition': 'very_good',
            'size': 'L',
            'color': 'Black',
            'description': 'Authentic Rolling Stones 1989 Steel Wheels Tour tee. Excellent vintage condition.',
            'brand_name': 'H&M',
            'category_name': 'Band Tees'
        },
        {
            'title': 'Nike Just Do It Vintage Tee',
            'price': 899,
            'quantity': 3,
            'is_available': True,
            'condition': 'excellent',
            'size': 'M',
            'color': 'White',
            'description': 'Classic Nike Just Do It slogan tee from the 90s. Minimal wear.',
            'brand_name': 'Nike',
            'category_name': 'Sports Tees'
        },
        {
            'title': 'Adidas Originals Trefoil Tee',
            'price': 750,
            'quantity': 0,
            'is_available': False,
            'condition': 'good',
            'size': 'XL',
            'color': 'Navy',
            'description': 'Adidas Originals trefoil logo tee. Has some fading but very wearable.',
            'brand_name': 'Adidas',
            'category_name': 'Sports Tees'
        },
        {
            'title': 'Vintage Coca-Cola Classic Tee',
            'price': 1200,
            'quantity': 2,
            'is_available': True,
            'condition': 'very_good',
            'size': 'L',
            'color': 'Red',
            'description': 'Classic Coca-Cola logo tee from the 80s. Great collector item.',
            'brand_name': 'Zara',
            'category_name': 'Vintage Tees'
        },
        {
            'title': 'Levi\'s Premium Denim Tee',
            'price': 1100,
            'quantity': 4,
            'is_available': True,
            'condition': 'excellent',
            'size': 'M',
            'color': 'Blue',
            'description': 'Levi\'s premium quality denim-inspired graphic tee. Like new condition.',
            'brand_name': 'Levi\'s',
            'category_name': 'Designer Tees'
        },
        {
            'title': 'Puma Sports Performance Tee',
            'price': 650,
            'quantity': 1,
            'is_available': True,
            'condition': 'fair',
            'size': 'S',
            'color': 'Gray',
            'description': 'Puma athletic performance tee. Shows some wear but still functional.',
            'brand_name': 'Puma',
            'category_name': 'Sports Tees'
        },
        {
            'title': 'Vintage MTV Logo Tee',
            'price': 1350,
            'quantity': 0,
            'is_available': False,
            'condition': 'poor',
            'size': 'L',
            'color': 'Black',
            'description': 'Classic MTV logo tee from the 90s. Has holes and heavy wear.',
            'brand_name': 'Uniqlo',
            'category_name': 'Vintage Tees'
        },
        {
            'title': 'Gap Essential Crew Neck',
            'price': 499,
            'quantity': 6,
            'is_available': True,
            'condition': 'excellent',
            'size': 'M',
            'color': 'White',
            'description': 'Gap essential crew neck tee. Perfect basic wardrobe item.',
            'brand_name': 'Gap',
            'category_name': 'Basic Tees'
        },
        {
            'title': 'Reebok Classic Vector Tee',
            'price': 799,
            'quantity': 2,
            'is_available': True,
            'condition': 'very_good',
            'size': 'L',
            'color': 'White',
            'description': 'Reebok classic vector logo tee. Clean and well-maintained.',
            'brand_name': 'Reebok',
            'category_name': 'Sports Tees'
        },
        {
            'title': 'Forever 21 Graphic Print Tee',
            'price': 599,
            'quantity': 3,
            'is_available': True,
            'condition': 'good',
            'size': 'S',
            'color': 'Pink',
            'description': 'Forever 21 trendy graphic print tee. Some minor pilling.',
            'brand_name': 'Forever 21',
            'category_name': 'Basic Tees'
        }
    ]

    print("📦 Creating/Updating Brands and Categories...")

    # Create or get brands
    brands = {}
    for brand_data in brands_data:
        brand, created = Brand.objects.get_or_create(
            slug=brand_data['slug'],
            defaults=brand_data
        )
        brands[brand_data['name']] = brand
        status = "✅ Created" if created else "📝 Updated"
        print(f"{status}: {brand.name}")

    # Create or get categories
    categories = {}
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        categories[cat_data['name']] = category
        status = "✅ Created" if created else "📝 Updated"
        print(f"{status}: {category.name}")

    print("\n👕 Creating/Updating Products...")

    created_products = []

    with transaction.atomic():
        for i, product_data in enumerate(products_data):
            brand = brands.get(product_data['brand_name'])
            category = categories.get(product_data['category_name'])

            if not brand or not category:
                print(f"❌ Missing brand or category for: {product_data['title']}")
                continue

            # Generate unique slug
            base_slug = slugify(product_data['title'])
            slug = base_slug
            counter = 1

            # Ensure slug uniqueness
            while TShirt.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            # Remove the brand_name and category_name from product data
            product_dict = {k: v for k, v in product_data.items()
                           if k not in ['brand_name', 'category_name']}

            product, created = TShirt.objects.update_or_create(
                slug=slug,
                defaults={
                    **product_dict,
                    'brand': brand,
                    'category': category
                }
            )

            status = "✅ Created" if created else "📝 Updated"
            availability = "✅ Available" if product.is_available else "❌ Out of Stock"
            print(f"{status}: {product.title} - {availability} (₹{product.price}) - Slug: {product.slug}")

            created_products.append(product)

    # Ensure shipping is configured
    print("\n🚚 Checking Shipping Configuration...")

    india_zone, zone_created = ShippingZone.objects.get_or_create(
        name='India',
        defaults={
            'description': 'Shipping within India',
            'base_cost': Decimal('50.00'),
            'free_shipping_threshold': Decimal('1000.00'),
            'states': 'AP,AR,AS,BR,CG,GA,GJ,HR,HP,JK,JH,KA,KL,MP,MH,MN,ML,MZ,NL,OR,PB,RJ,SK,TN,TG,TR,UP,UT,WB,DL,PY,LD,AN,DN,CH',
            'metro_cities': '110001,400001,700001,600001,560001,500001,380001,411001,122001,201001',
            'is_active': True
        }
    )

    if zone_created:
        print("✅ Created India shipping zone")
    else:
        print("📝 India shipping zone already exists")

    # Create shipping methods if they don't exist
    standard_method, std_created = ShippingMethod.objects.get_or_create(
        name='Standard Shipping',
        defaults={
            'description': '3-5 business days delivery',
            'estimated_days': 4,
            'cost_multiplier': Decimal('1.0'),
            'is_active': True
        }
    )

    express_method, exp_created = ShippingMethod.objects.get_or_create(
        name='Express Shipping',
        defaults={
            'description': '1-2 business days delivery',
            'estimated_days': 2,
            'cost_multiplier': Decimal('2.0'),
            'is_active': True
        }
    )

    if std_created or exp_created:
        print("✅ Created/Updated shipping methods")

        # Create shipping rates
        ShippingRate.objects.get_or_create(
            zone=india_zone,
            method=standard_method,
            defaults={
                'min_weight_kg': Decimal('0.0'),
                'max_weight_kg': Decimal('1.0'),
                'base_cost': Decimal('50.00'),
                'per_kg_cost': Decimal('10.00'),  # ✅ Positive value
                'insurance_rate': Decimal('0.02'),
                'is_active': True
            }
        )

        ShippingRate.objects.get_or_create(
            zone=india_zone,
            method=express_method,
            defaults={
                'min_weight_kg': Decimal('0.0'),
                'max_weight_kg': Decimal('1.0'),
                'base_cost': Decimal('100.00'),
                'per_kg_cost': Decimal('20.00'),  # ✅ Positive value
                'insurance_rate': Decimal('0.03'),
                'is_active': True
            }
        )
        print("✅ Created shipping rates")

    print("\n🎉 Product Population Complete!")
    print("=" * 50)
    print("📊 Summary:")
    print(f"   Products: {len(created_products)}")
    print(f"   Available: {len([p for p in created_products if p.is_available])}")
    print(f"   Out of Stock: {len([p for p in created_products if not p.is_available])}")
    print(f"   Brands: {len(brands)}")
    print(f"   Categories: {len(categories)}")
    print(f"   Shipping: ✅ Configured")

    print("\n🔗 Ready to use:")
    print("   Frontend: http://localhost:3000/products")
    print("   Admin: http://localhost:8000/admin")


if __name__ == "__main__":
    populate_products()
