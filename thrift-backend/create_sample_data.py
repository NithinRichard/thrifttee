import os
import django
from django.core.management import execute_from_command_line

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
django.setup()

from apps.products.models import Brand, Category, TShirt
from django.contrib.auth.models import User

def create_sample_data():
    print("Creating sample data...")
    
    # Create superuser if it doesn't exist
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@thriftshop.com', 'admin123')
        print("Created superuser: admin/admin123")
    
    # Create brands
    brands_data = [
        {'name': 'Nike', 'slug': 'nike', 'description': 'Just Do It'},
        {'name': 'Adidas', 'slug': 'adidas', 'description': 'Impossible is Nothing'},
        {'name': 'Vintage Band Tees', 'slug': 'vintage-band-tees', 'description': 'Classic band merchandise'},
        {'name': 'Local Brands', 'slug': 'local-brands', 'description': 'Support local businesses'},
        {'name': 'Unbranded', 'slug': 'unbranded', 'description': 'Quality without the label'},
    ]
    
    for brand_data in brands_data:
        brand, created = Brand.objects.get_or_create(
            slug=brand_data['slug'],
            defaults=brand_data
        )
        if created:
            print(f"Created brand: {brand.name}")

    # Create categories
    categories_data = [
        {'name': 'Graphic Tees', 'slug': 'graphic-tees', 'description': 'T-shirts with graphics and designs'},
        {'name': 'Plain Tees', 'slug': 'plain-tees', 'description': 'Simple, solid color t-shirts'},
        {'name': 'Band Tees', 'slug': 'band-tees', 'description': 'Music band merchandise'},
        {'name': 'Sports Tees', 'slug': 'sports-tees', 'description': 'Athletic and sports-themed t-shirts'},
        {'name': 'Vintage', 'slug': 'vintage', 'description': 'Retro and vintage style t-shirts'},
    ]
    
    for category_data in categories_data:
        category, created = Category.objects.get_or_create(
            slug=category_data['slug'],
            defaults=category_data
        )
        if created:
            print(f"Created category: {category.name}")

    # Create sample t-shirts (without images for now)
    sample_tshirts = [
        {
            'title': 'Vintage Nike Swoosh Tee',
            'slug': 'vintage-nike-swoosh-tee',
            'description': 'Classic Nike t-shirt with the iconic swoosh logo. Soft cotton blend in excellent condition.',
            'brand': 'nike',
            'category': 'sports-tees',
            'size': 'm',
            'color': 'Black',
            'material': '100% Cotton',
            'condition': 'excellent',
            'price': 25.99,
            'original_price': 35.00,
            'is_featured': True,
            'tags': 'nike, swoosh, black, cotton, vintage'
        },
        {
            'title': 'Adidas Three Stripes Classic',
            'slug': 'adidas-three-stripes-classic',
            'description': 'Timeless Adidas design with the famous three stripes. Perfect for casual wear.',
            'brand': 'adidas',
            'category': 'sports-tees',
            'size': 'l',
            'color': 'White',
            'material': '90% Cotton, 10% Polyester',
            'condition': 'very_good',
            'price': 22.50,
            'original_price': 30.00,
            'is_featured': True,
            'tags': 'adidas, three stripes, white, classic'
        },
        {
            'title': 'The Beatles Abbey Road Tee',
            'slug': 'beatles-abbey-road-tee',
            'description': 'Iconic Beatles t-shirt featuring the famous Abbey Road album cover. A must-have for music lovers.',
            'brand': 'vintage-band-tees',
            'category': 'band-tees',
            'size': 'm',
            'color': 'Navy Blue',
            'material': '100% Cotton',
            'condition': 'good',
            'price': 28.99,
            'original_price': 40.00,
            'is_featured': True,
            'tags': 'beatles, abbey road, navy, music, vintage'
        },
        {
            'title': 'Plain Black Cotton Tee',
            'slug': 'plain-black-cotton-tee',
            'description': 'Simple, versatile black t-shirt. Perfect for layering or wearing on its own.',
            'brand': 'unbranded',
            'category': 'plain-tees',
            'size': 's',
            'color': 'Black',
            'material': '100% Organic Cotton',
            'condition': 'excellent',
            'price': 15.99,
            'is_featured': False,
            'tags': 'black, plain, organic cotton, basic'
        },
        {
            'title': 'Retro Sunset Graphic Tee',
            'slug': 'retro-sunset-graphic-tee',
            'description': 'Beautiful retro-style graphic tee with sunset design. Brings back the 80s vibes.',
            'brand': 'local-brands',
            'category': 'graphic-tees',
            'size': 'xl',
            'color': 'Orange',
            'material': '50% Cotton, 50% Polyester',
            'condition': 'very_good',
            'price': 19.99,
            'original_price': 25.00,
            'is_featured': False,
            'tags': 'retro, sunset, graphic, orange, 80s'
        },
        {
            'title': 'Vintage Rock Band Tee',
            'slug': 'vintage-rock-band-tee',
            'description': 'Classic rock band merchandise from the 90s. Authentic vintage feel.',
            'brand': 'vintage-band-tees',
            'category': 'band-tees',
            'size': 'l',
            'color': 'Gray',
            'material': '100% Cotton',
            'condition': 'good',
            'price': 32.99,
            'original_price': 45.00,
            'is_featured': True,
            'tags': 'rock, band, vintage, gray, 90s'
        },
        {
            'title': 'Nike Athletic Performance Tee',
            'slug': 'nike-athletic-performance-tee',
            'description': 'High-performance Nike athletic t-shirt with moisture-wicking technology.',
            'brand': 'nike',
            'category': 'sports-tees',
            'size': 'm',
            'color': 'Blue',
            'material': '100% Polyester',
            'condition': 'excellent',
            'price': 18.99,
            'original_price': 28.00,
            'is_featured': False,
            'tags': 'nike, athletic, performance, blue, polyester'
        },
        {
            'title': 'Plain White Basic Tee',
            'slug': 'plain-white-basic-tee',
            'description': 'Essential white t-shirt for any wardrobe. Comfortable and versatile.',
            'brand': 'unbranded',
            'category': 'plain-tees',
            'size': 'm',
            'color': 'White',
            'material': '100% Cotton',
            'condition': 'very_good',
            'price': 12.99,
            'is_featured': False,
            'tags': 'white, plain, basic, cotton, essential'
        }
    ]
    
    for tshirt_data in sample_tshirts:
        brand = Brand.objects.get(slug=tshirt_data['brand'])
        category = Category.objects.get(slug=tshirt_data['category'])
        
        tshirt_data['brand'] = brand
        tshirt_data['category'] = category
        
        # Create a placeholder image path (you can add real images later)
        tshirt_data['primary_image'] = f'tshirts/primary/{tshirt_data["slug"]}.jpg'
        
        tshirt, created = TShirt.objects.get_or_create(
            slug=tshirt_data['slug'],
            defaults=tshirt_data
        )
        
        if created:
            print(f"Created t-shirt: {tshirt.title}")

    print("Sample data created successfully!")
    print("\nYou can now:")
    print("1. Start the Django server: python manage.py runserver")
    print("2. Access admin panel: http://localhost:8000/admin/ (admin/admin123)")
    print("3. Test API endpoints: http://localhost:8000/api/v1/products/tshirts/")

if __name__ == '__main__':
    create_sample_data()