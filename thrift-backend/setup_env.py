#!/bin/bash
# Setup script for ThriftTees environment variables

echo "Setting up environment variables for ThriftTees..."

# Create .env file with Razorpay configuration
cat > .env << 'EOF'
# Django Settings
SECRET_KEY=your-super-secret-key-here-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=thrift_shop
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Razorpay Payment Gateway Configuration
RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here

# Stripe (if needed)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Redis
REDIS_URL=redis://localhost:6379/0
EOF

echo "✅ Created .env file with Razorpay configuration"
echo ""
echo "📝 Next steps:"
echo "1. Edit the .env file and replace the placeholder values with your actual Razorpay credentials"
echo "2. Get your Razorpay credentials from: https://dashboard.razorpay.com/"
echo "3. Test Key ID: rzp_test_xxxxxxxxxx"
echo "4. Test Secret Key: xxxxxxxxxxxxxxxxxxxxxxxxxx"
echo ""
echo "🔧 To get production credentials:"
echo "1. Sign up at https://razorpay.com/"
echo "2. Go to Settings > API Keys"
echo "3. Generate Live API Keys"
echo "4. Replace the test credentials with live ones"
echo ""
echo "🚀 Your Django settings are already configured to read from .env file!"
