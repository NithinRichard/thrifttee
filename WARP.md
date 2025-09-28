# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

ThriftTees is a modern thrift t-shirt shop built with Django REST Framework backend and React frontend, featuring Razorpay payment integration, vintage-style UI with parallax effects, and comprehensive condition reporting for pre-owned t-shirts.

## Architecture

### Backend (Django)
- **Framework**: Django 4.2 with Django REST Framework
- **Database**: SQLite (dev), PostgreSQL (production) 
- **Payment**: Razorpay integration for Indian market
- **Apps**: `products`, `users`, `orders`, `cart`, `common`
- **Authentication**: Token-based authentication

### Frontend (React)
- **Framework**: React 18 with functional components
- **Styling**: Tailwind CSS with vintage-themed color palette
- **Animation**: Framer Motion for parallax effects and smooth transitions
- **State**: React Context + useReducer, React Query for server state
- **Routing**: React Router DOM

### Key Models
- **TShirt**: Complex model with detailed condition tracking, measurements, and multiple photo fields
- **Order**: Enhanced with Razorpay-specific fields (`payment_token`, `transaction_id`, `auth_code`)
- **Brand/Category**: Support for filtering and categorization

## Common Development Commands

### Backend (Django)
```bash
# Setup and activation
cd thrift-backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Unix/macOS: 
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Database operations
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# Development server
python manage.py runserver

# Create sample data
python create_sample_data.py

# Testing
python manage.py test
python test_rupay_integration.py
python test_order_creation.py
```

### Frontend (React)
```bash
# Setup
cd thrift-frontend
npm install

# Development server
npm start

# Testing
npm test

# Build for production
npm run build
```

### Docker Development
```bash
# Full stack development
docker-compose up --build

# Backend-only development
docker-compose up db redis backend

# Run migrations in container
docker-compose exec backend python manage.py migrate
```

### Testing Individual Components
```bash
# Test specific API endpoints
python test_api_request.py
python test_shipping.py

# Debug shipping calculations
python debug_shipping.py
python debug_rate_selection.py

# Test reviews integration
python test-reviews-integration.py
```

## Project Structure

### Backend Structure
- `apps/products/models.py`: Complex TShirt model with condition reporting
- `apps/orders/models.py`: Razorpay-enhanced Order model
- `config/settings.py`: Main settings (note: uses both `thrift_shop/` and `config/`)
- `create_sample_data.py`: Populates database with sample t-shirts
- Test files scattered in root: `test_*.py` for various components

### Frontend Structure  
- `src/components/`: Organized by feature (auth, cart, checkout, common, creport)
- `src/components/creport/`: Condition reporting components for detailed item assessment
- `VintageShippingSelector.jsx`: Custom shipping selection component
- Tailwind config with vintage/earth color themes

## Development Patterns

### Backend Patterns
- Apps follow Django best practices with models, views, serializers, urls
- Complex model relationships with detailed condition tracking
- Token authentication with proper CORS setup
- Payment integration through Razorpay gateway
- Comprehensive error handling in views

### Frontend Patterns
- Functional components with hooks
- Context for global state management
- Framer Motion for animations and parallax scrolling
- Component composition with reusable vintage-themed components
- Form handling with proper validation

## Environment Configuration

### Backend (.env)
```env
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,testserver

# Razorpay
RAZORPAY_KEY_ID=rzp_test_demo_key_id
RAZORPAY_KEY_SECRET=demo_secret_key
RAZORPAY_WEBHOOK_SECRET=demo_webhook_secret

# Database (production)
DB_NAME=thrift_shop
DB_USER=postgres
DB_PASSWORD=password
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_RAZORPAY_KEY_ID=rzp_test_demo_key_id
```

## Key Features

### Product Management
- Detailed condition assessment with confidence levels
- Multiple photos including condition-specific shots
- Comprehensive measurements (pit-to-pit, shoulder width, etc.)
- Brand and category management
- Condition verification system

### Payment Processing
- Full Razorpay integration optimized for Indian market
- Real-time payment verification
- Transaction tracking and status management
- Support for UPI, cards, and other Indian payment methods

### UI/UX Features
- Vintage-themed design with earth tone color palette
- Parallax scrolling effects using Framer Motion
- Responsive design with mobile-first approach
- Smooth animations and transitions
- Detailed product condition reporting interface

## API Endpoints

### Core Endpoints
- `GET/POST /api/v1/products/tshirts/` - Product listing and creation
- `GET/POST /api/v1/orders/` - Order management
- `POST /api/v1/orders/verify_payment/` - Razorpay payment verification
- `GET/POST /api/v1/cart/` - Shopping cart operations

### Authentication
- Token-based authentication
- CORS configured for localhost:3000

## Testing Strategy

### Backend Tests
- Unit tests for models and API endpoints
- Payment integration testing with Razorpay
- Shipping calculation validation
- Sample data creation and verification

### Frontend Tests
- Component testing with React Testing Library
- Integration tests for payment flows
- E2E testing for critical user journeys

## Quick Start

Use the provided `quick_start.bat` for Windows setup or follow manual setup:

1. **Backend**: `cd thrift-backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt`
2. **Database**: `python manage.py migrate && python create_sample_data.py`
3. **Frontend**: `cd thrift-frontend && npm install`
4. **Start**: Backend: `python manage.py runserver`, Frontend: `npm start`

## Development Notes

- The project includes both `thrift_shop/` and `config/` directories for Django settings
- Payment integration is specifically designed for the Indian market with Razorpay
- The TShirt model is highly detailed with condition reporting features
- Frontend uses vintage aesthetic with careful attention to typography and color
- Docker configuration available for containerized development
- Multiple test files indicate thorough testing approach