# Thrift T-Shirt Shop - Implementation Guide

## 🎯 Quick Start Implementation

This guide provides step-by-step instructions to get your thrift t-shirt shop up and running quickly.

## Phase 1: Backend Setup (Django)

### 1.1 Environment Setup

```bash
# Navigate to backend directory
cd thrift-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 1.2 Database Configuration

Create `.env` file in `thrift-backend/`:

```env
# Django Settings
SECRET_KEY=your-super-secret-key-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite for development)
DB_NAME=db.sqlite3
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=

# For PostgreSQL (production):
# DB_NAME=thrift_shop
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_HOST=localhost
# DB_PORT=5432

# Stripe (get from Stripe dashboard)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Redis (optional for development)
REDIS_URL=redis://localhost:6379/0
```

### 1.3 Django Project Setup

Create the main Django project files:

**thrift-backend/manage.py:**
```python
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

if __name__ == '__main__':
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
```

**thrift-backend/thrift_shop/settings.py:**
```python
import os
from decouple import config, Csv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-me')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

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
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# For PostgreSQL:
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': config('DB_NAME'),
#         'USER': config('DB_USER'),
#         'PASSWORD': config('DB_PASSWORD'),
#         'HOST': config('DB_HOST', default='localhost'),
#         'PORT': config('DB_PORT', default='5432'),
#     }
# }

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

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

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
```

**thrift-backend/thrift_shop/wsgi.py:**
```python
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
application = get_wsgi_application()
```

### 1.4 Run Initial Migrations

```bash
# Create migrations for your apps
python manage.py makemigrations products
python manage.py makemigrations users
python manage.py makemigrations orders
python manage.py makemigrations cart

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

## Phase 2: Frontend Setup (React)

### 2.1 Environment Setup

```bash
# Navigate to frontend directory
cd thrift-frontend

# Install dependencies
npm install

# Install additional dependencies
npm install axios framer-motion react-router-dom react-hook-form @tanstack/react-query

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2.2 Tailwind Configuration

Update `thrift-frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
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
      }
    },
  },
  plugins: [],
}
```

### 2.3 Main App Component

**thrift-frontend/src/App.js:**
```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './contexts/AppContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import './styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
```

### 2.4 Global Styles

**thrift-frontend/src/styles/globals.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Georgia:wght@400;700&display=swap');

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Georgia', serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-vintage-600 hover:bg-vintage-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md overflow-hidden;
  }
  
  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-500 focus:border-transparent;
  }
  
  .parallax-container {
    @apply relative overflow-hidden;
  }
}

@layer utilities {
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .bg-gradient-vintage {
    background: linear-gradient(135deg, #f4ede1 0%, #e8d9c2 100%);
  }
  
  .bg-gradient-earth {
    background: linear-gradient(135deg, #ebe6dc 0%, #d8ccbb 100%);
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1935e;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #b48252;
}

/* Loading animations */
.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #c1935e;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Parallax effects */
.parallax-slow {
  transform: translateZ(0);
  will-change: transform;
}

/* Image hover effects */
.image-hover-zoom {
  transition: transform 0.3s ease;
}

.image-hover-zoom:hover {
  transform: scale(1.05);
}

/* Product card animations */
.product-card {
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

## Phase 3: Key Components Implementation

### 3.1 Header Component

**thrift-frontend/src/components/common/Header.js:**
```jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import SearchBar from './SearchBar';
import CartIcon from './CartIcon';

const Header = () => {
  const { state, actions } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    actions.logoutUser();
    navigate('/');
  };

  return (
    <motion.header 
      className="bg-white shadow-md sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-vintage font-bold text-vintage-700"
            >
              ThriftTees
            </motion.div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-vintage-600 transition-colors"
            >
              Shop
            </Link>
            
            {state.isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-vintage-600 transition-colors"
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-vintage-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-vintage-600 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
            
            <CartIcon />
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <SearchBar />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 py-4"
          >
            <div className="flex flex-col space-y-4">
              <Link to="/products" className="text-gray-700 hover:text-vintage-600">
                Shop
              </Link>
              {state.isAuthenticated ? (
                <>
                  <Link to="/profile" className="text-gray-700 hover:text-vintage-600">
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="text-left text-gray-700 hover:text-vintage-600">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-vintage-600">
                    Login
                  </Link>
                  <Link to="/register" className="text-gray-700 hover:text-vintage-600">
                    Sign Up
                  </Link>
                </>
              )}
              <Link to="/cart" className="text-gray-700 hover:text-vintage-600">
                Cart ({state.cartCount})
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
```

### 3.2 Product Card Component

**thrift-frontend/src/components/product/ProductCard.js:**
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';

const ProductCard = ({ product }) => {
  const { actions } = useApp();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    actions.addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.primary_image,
      size: product.size,
      brand: product.brand.name,
      quantity: 1
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="product-card card group"
    >
      <Link to={`/products/${product.slug}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.primary_image}
            alt={product.title}
            className="w-full h-64 object-cover image-hover-zoom"
          />
          
          {/* Discount Badge */}
          {product.discount_percentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
              -{product.discount_percentage}%
            </div>
          )}
          
          {/* Featured Badge */}
          {product.is_featured && (
            <div className="absolute top-2 right-2 bg-vintage-600 text-white px-2 py-1 rounded-full text-sm font-medium">
              Featured
            </div>
          )}
          
          {/* Quick Add Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 bg-white text-vintage-600 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </motion.button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">{product.brand.name}</span>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {product.size.toUpperCase()}
            </span>
          </div>
          
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
            {product.title}
          </h3>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-vintage-600">
                ${product.price}
              </span>
              {product.original_price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.original_price}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${
                product.condition === 'excellent' ? 'bg-green-500' :
                product.condition === 'very_good' ? 'bg-blue-500' :
                product.condition === 'good' ? 'bg-yellow-500' : 'bg-orange-500'
              }`}></div>
              <span className="text-xs text-gray-500 capitalize">
                {product.condition.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{product.color}</span>
            <span>{new Date(product.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
```

### 3.3 Parallax Hero Section

**thrift-frontend/src/components/common/ParallaxHero.js:**
```jsx
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const ParallaxHero = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-vintage">
      {/* Background Image with Parallax */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <div 
          className="w-full h-[120%] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex items-center justify-center h-full text-center text-white px-4"
      >
        <div className="max-w-4xl">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-vintage font-bold mb-6 text-shadow"
          >
            Vintage Vibes,
            <br />
            Modern Style
          </motion.h1>
          
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 text-shadow"
          >
            Discover unique pre-owned t-shirts with character and history.
            <br />
            Sustainable fashion that tells a story.
          </motion.p>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/products"
              className="bg-vintage-600 hover:bg-vintage-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105"
            >
              Shop Collection
            </Link>
            
            <Link
              to="/products?featured=true"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-vintage-600 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105"
            >
              Featured Items
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center"
        >
          <span className="text-sm mb-2">Scroll to explore</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ParallaxHero;
```

## Phase 4: Running the Application

### 4.1 Start Backend Server

```bash
cd thrift-backend
python manage.py runserver
```

The Django admin will be available at: http://localhost:8000/admin/
API endpoints will be available at: http://localhost:8000/api/v1/

### 4.2 Start Frontend Server

```bash
cd thrift-frontend
npm start
```

The React app will be available at: http://localhost:3000/

## Phase 5: Adding Sample Data

### 5.1 Create Sample Data Script

**thrift-backend/create_sample_data.py:**
```python
import os
import django
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
django.setup()

from apps.products.models import Brand, Category, TShirt

def create_sample_data():
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

    # Create sample t-shirts
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
        }
    ]
    
    for tshirt_data in sample_tshirts:
        brand = Brand.objects.get(slug=tshirt_data['brand'])
        category = Category.objects.get(slug=tshirt_data['category'])
        
        tshirt_data['brand'] = brand
        tshirt_data['category'] = category
        
        tshirt, created = TShirt.objects.get_or_create(
            slug=tshirt_data['slug'],
            defaults=tshirt_data
        )
        
        if created:
            print(f"Created t-shirt: {tshirt.title}")

if __name__ == '__main__':
    create_sample_data()
    print("Sample data created successfully!")
```

Run the script:
```bash
cd thrift-backend
python create_sample_data.py
```

## Phase 6: Testing Your Application

### 6.1 Test API Endpoints

```bash
# Test products endpoint
curl http://localhost:8000/api/v1/products/tshirts/

# Test specific product
curl http://localhost:8000/api/v1/products/tshirts/vintage-nike-swoosh-tee/

# Test search
curl "http://localhost:8000/api/v1/products/tshirts/?search=nike"

# Test filtering
curl "http://localhost:8000/api/v1/products/tshirts/?brand=nike&size=m"
```

### 6.2 Frontend Testing

1. Visit http://localhost:3000/
2. Test the parallax hero section
3. Browse products at http://localhost:3000/products
4. Test search and filtering
5. Add items to cart
6. Test responsive design on mobile

## Next Steps

1. **Add Authentication**: Implement JWT authentication for users
2. **Payment Integration**: Add Stripe payment processing
3. **Image Upload**: Implement image upload for products
4. **Reviews System**: Add product reviews and ratings
5. **Order Management**: Complete order processing workflow
6. **Email Notifications**: Add email confirmations
7. **SEO Optimization**: Add meta tags and structured data
8. **Performance**: Implement caching and optimization
9. **Testing**: Add comprehensive test suites
10. **Deployment**: Deploy to production environment

Your thrift t-shirt shop foundation is now ready! The project includes modern design patterns, responsive UI, parallax effects, and a solid API architecture that can scale as your business grows.