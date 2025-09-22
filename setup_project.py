#!/usr/bin/env python3
"""
Project Setup Script for Thrift T-Shirt Shop
This script creates the initial project structure for both Django backend and React frontend.
"""

import os
import subprocess
import sys

def create_directory_structure():
    """Create the basic directory structure for the project."""
    
    # Backend structure
    backend_dirs = [
        'thrift-backend',
        'thrift-backend/apps',
        'thrift-backend/apps/products',
        'thrift-backend/apps/users', 
        'thrift-backend/apps/orders',
        'thrift-backend/apps/cart',
        'thrift-backend/apps/common',
        'thrift-backend/media',
        'thrift-backend/media/tshirts',
        'thrift-backend/media/tshirts/primary',
        'thrift-backend/static',
        'thrift-backend/tests',
        'thrift-backend/config',
    ]
    
    # Frontend structure
    frontend_dirs = [
        'thrift-frontend',
        'thrift-frontend/src',
        'thrift-frontend/src/components',
        'thrift-frontend/src/components/common',
        'thrift-frontend/src/components/product',
        'thrift-frontend/src/components/cart',
        'thrift-frontend/src/components/user',
        'thrift-frontend/src/components/checkout',
        'thrift-frontend/src/pages',
        'thrift-frontend/src/hooks',
        'thrift-frontend/src/services',
        'thrift-frontend/src/utils',
        'thrift-frontend/src/styles',
        'thrift-frontend/src/assets',
        'thrift-frontend/src/contexts',
    ]
    
    all_dirs = backend_dirs + frontend_dirs
    
    for directory in all_dirs:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Created directory: {directory}")

def create_backend_files():
    """Create initial Django backend files."""
    
    # Requirements file
    requirements_content = """Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
Pillow==10.1.0
python-decouple==3.8
django-filter==23.3
psycopg2-binary==2.9.9
celery==5.3.4
redis==5.0.1
stripe==7.8.0
gunicorn==21.2.0
whitenoise==6.6.0
"""
    
    with open('thrift-backend/requirements.txt', 'w') as f:
        f.write(requirements_content)
    
    # Django settings template
    settings_content = """import os
from decouple import config
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='your-secret-key-here')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'corsheaders',
    'django_filters',
]

LOCAL_APPS = [
    'apps.products',
    'apps.users',
    'apps.orders',
    'apps.cart',
    'apps.common',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'thrift_shop.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'thrift_shop.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='thrift_shop'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='password'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

# Stripe settings
STRIPE_PUBLISHABLE_KEY = config('STRIPE_PUBLISHABLE_KEY', default='')
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY', default='')

# Celery settings
CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379/0')
"""
    
    with open('thrift-backend/config/settings.py', 'w') as f:
        f.write(settings_content)
    
    # Environment template
    env_content = """# Django Settings
SECRET_KEY=your-super-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=thrift_shop
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Redis
REDIS_URL=redis://localhost:6379/0
"""
    
    with open('thrift-backend/.env.example', 'w') as f:
        f.write(env_content)
    
    print("✓ Created Django backend configuration files")

def create_frontend_files():
    """Create initial React frontend files."""
    
    # Package.json
    package_json_content = """{
  "name": "thrift-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.5.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "react-router-dom": "^6.8.1",
    "axios": "^1.6.2",
    "framer-motion": "^10.16.5",
    "react-hook-form": "^7.48.2",
    "@tanstack/react-query": "^5.8.4",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  },
  "proxy": "http://localhost:8000"
}"""
    
    with open('thrift-frontend/package.json', 'w') as f:
        f.write(package_json_content)
    
    # Tailwind config
    tailwind_config = """/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          50: '#faf7f0',
          100: '#f4ede1',
          200: '#e8d9c2',
          300: '#dbc19e',
          400: '#cca678',
          500: '#c1935e',
          600: '#b48252',
          700: '#966a45',
          800: '#7a563d',
          900: '#644733',
        },
        earth: {
          50: '#f6f4f0',
          100: '#ebe6dc',
          200: '#d8ccbb',
          300: '#c0ab94',
          400: '#a8896f',
          500: '#967558',
          600: '#89654c',
          700: '#725340',
          800: '#5e4538',
          900: '#4e3a30',
        }
      },
      fontFamily: {
        'vintage': ['Georgia', 'serif'],
        'modern': ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'parallax': 'parallax 1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        parallax: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}"""
    
    with open('thrift-frontend/tailwind.config.js', 'w') as f:
        f.write(tailwind_config)
    
    # Environment template
    env_content = """REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
"""
    
    with open('thrift-frontend/.env.example', 'w') as f:
        f.write(env_content)
    
    print("✓ Created React frontend configuration files")

def create_docker_files():
    """Create Docker configuration files."""
    
    # Backend Dockerfile
    backend_dockerfile = """FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    postgresql-client \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "thrift_shop.wsgi:application"]
"""
    
    with open('thrift-backend/Dockerfile', 'w') as f:
        f.write(backend_dockerfile)
    
    # Frontend Dockerfile
    frontend_dockerfile = """FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
"""
    
    with open('thrift-frontend/Dockerfile', 'w') as f:
        f.write(frontend_dockerfile)
    
    # Docker Compose
    docker_compose = """version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: thrift_shop
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./thrift-backend
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
      - DB_HOST=db
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./thrift-backend:/app
      - media_files:/app/media

  frontend:
    build: ./thrift-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  media_files:
"""
    
    with open('docker-compose.yml', 'w') as f:
        f.write(docker_compose)
    
    print("✓ Created Docker configuration files")

def create_readme():
    """Create comprehensive README file."""
    
    readme_content = """# Thrift T-Shirt Shop

A modern, aesthetic thrift shop focused exclusively on pre-owned t-shirts built with Django and React.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for caching)

### Backend Setup (Django)

1. Navigate to backend directory:
```bash
cd thrift-backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Start development server:
```bash
python manage.py runserver
```

### Frontend Setup (React)

1. Navigate to frontend directory:
```bash
cd thrift-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Install Tailwind CSS:
```bash
npx tailwindcss init -p
```

5. Start development server:
```bash
npm start
```

### Using Docker (Recommended)

1. Build and start all services:
```bash
docker-compose up --build
```

2. Run migrations:
```bash
docker-compose exec backend python manage.py migrate
```

3. Create superuser:
```bash
docker-compose exec backend python manage.py createsuperuser
```

## 📁 Project Structure

```
thrift/
├── thrift-backend/          # Django REST API
│   ├── apps/
│   │   ├── products/        # T-shirt models and APIs
│   │   ├── users/           # User management
│   │   ├── orders/          # Order processing
│   │   ├── cart/            # Shopping cart
│   │   └── common/          # Shared utilities
│   ├── config/              # Django settings
│   ├── media/               # User uploaded files
│   └── static/              # Static files
├── thrift-frontend/         # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks
│   │   └── styles/          # CSS and styling
└── docker-compose.yml       # Docker configuration
```

## 🛠 Technology Stack

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Database
- **Redis** - Caching and task queue
- **Celery** - Background tasks
- **Stripe** - Payment processing

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations and parallax
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hook Form** - Form handling

## 🎨 Design System

### Color Palette
- **Vintage**: Warm, earthy tones for vintage aesthetic
- **Earth**: Natural, muted colors for modern feel
- **Accent**: Carefully chosen highlights

### Typography
- **Headers**: Georgia (vintage feel)
- **Body**: Inter (modern readability)

### Components
- Clean, minimalist design
- Subtle parallax effects
- High-quality product imagery
- Intuitive navigation

## 📱 Features

### MVP Features
- [x] Product catalog with filtering
- [x] User authentication
- [x] Shopping cart
- [x] Checkout process
- [x] Order management
- [x] Search functionality

### Advanced Features (Planned)
- [ ] Real-time inventory updates
- [ ] Advanced search with Elasticsearch
- [ ] User reviews and ratings
- [ ] Wishlist functionality
- [ ] Email notifications
- [ ] Analytics dashboard

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd thrift-backend
python manage.py test

# Frontend tests
cd thrift-frontend
npm test
```

### Code Quality
```bash
# Backend linting
flake8 .
black .

# Frontend linting
npm run lint
npm run format
```

### Database Management
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database
python manage.py flush
```

## 🚀 Deployment

### Production Environment Variables
```bash
# Django
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com

# Database
DB_NAME=thrift_shop_prod
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_HOST=your-db-host

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key
```

### Deployment Options
- **Heroku**: Easy deployment with buildpacks
- **DigitalOcean**: App Platform or Droplets
- **AWS**: EC2, RDS, S3 for media files
- **Vercel/Netlify**: Frontend deployment

## 📚 API Documentation

### Authentication
```bash
POST /api/v1/users/login/
POST /api/v1/users/register/
```

### Products
```bash
GET /api/v1/products/tshirts/
GET /api/v1/products/tshirts/{id}/
GET /api/v1/products/search/?q=vintage
```

### Cart
```bash
GET /api/v1/cart/
POST /api/v1/cart/add/
PUT /api/v1/cart/update/{item_id}/
DELETE /api/v1/cart/remove/{item_id}/
```

### Orders
```bash
POST /api/v1/orders/
GET /api/v1/orders/
GET /api/v1/orders/{id}/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@thriftshop.com or create an issue in the repository.
"""
    
    with open('README.md', 'w') as f:
        f.write(readme_content)
    
    print("✓ Created comprehensive README file")

def main():
    """Main setup function."""
    print("🚀 Setting up Thrift T-Shirt Shop project structure...")
    print("=" * 60)
    
    try:
        create_directory_structure()
        create_backend_files()
        create_frontend_files()
        create_docker_files()
        create_readme()
        
        print("\n" + "=" * 60)
        print("✅ Project setup completed successfully!")
        print("\n📋 Next Steps:")
        print("1. Review the PROJECT_ROADMAP.md for detailed development plan")
        print("2. Set up your development environment:")
        print("   - Install Python 3.11+, Node.js 18+, PostgreSQL")
        print("3. Follow the README.md instructions to start development")
        print("4. Begin with Phase 1: Backend Django setup")
        print("\n🎯 Quick Start Commands:")
        print("   cd thrift-backend && python -m venv venv && source venv/bin/activate")
        print("   pip install -r requirements.txt")
        print("   cd ../thrift-frontend && npm install")
        print("\n🐳 Or use Docker:")
        print("   docker-compose up --build")
        
    except Exception as e:
        print(f"❌ Error during setup: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()