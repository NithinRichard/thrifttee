# Phase 4: Security Fixes - Implementation Guide

## 🔒 Critical Security Fixes Implemented

### 1. Environment Variables & Secrets Management ✅

**Files Created:**
- `.env.example` - Template for environment variables
- `requirements-security.txt` - Security dependencies

**Files Updated:**
- `thrift_shop/settings.py` - Now uses environment variables

**Changes:**
- ✅ Removed hardcoded SECRET_KEY
- ✅ Removed hardcoded Razorpay credentials
- ✅ Removed hardcoded Shiprocket credentials
- ✅ Added python-dotenv for .env file support
- ✅ Added validation for required environment variables

**Setup Instructions:**
```bash
# 1. Install python-dotenv
pip install python-dotenv

# 2. Create .env file
cp .env.example .env

# 3. Fill in your credentials
nano .env

# 4. Never commit .env file
echo ".env" >> .gitignore
```

---

### 2. Input Validation & Sanitization ✅

**Files Created:**
- `apps/common/validators.py` - Input validation utilities

**Functions:**
- `sanitize_html()` - Remove HTML/scripts from text
- `validate_email()` - Email format validation
- `validate_phone()` - Phone number validation
- `validate_pincode()` - PIN code validation
- `sanitize_search_query()` - Prevent SQL injection
- `validate_price()` - Price validation
- `validate_quantity()` - Quantity validation

**Usage:**
```python
from apps.common.validators import sanitize_html, validate_email

# Sanitize user input
clean_text = sanitize_html(user_input)

# Validate email
try:
    email = validate_email(user_email)
except ValidationError as e:
    return Response({'error': str(e)}, status=400)
```

---

### 3. Security Middleware ✅

**Files Created:**
- `apps/common/security_middleware.py`

**Features:**
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ Content Security Policy (CSP)
- ✅ XSS protection headers
- ✅ Input sanitization for dangerous patterns
- ✅ HTTPS enforcement (production)

**To Enable:**
```python
# In settings.py MIDDLEWARE, add:
MIDDLEWARE = [
    # ... existing middleware ...
    'apps.common.security_middleware.SecurityHeadersMiddleware',
    'apps.common.security_middleware.InputSanitizationMiddleware',
]
```

---

## 🔐 Security Checklist

### Immediate Actions Required

- [ ] **Create .env file** with all credentials
- [ ] **Install security dependencies**
  ```bash
  pip install -r requirements-security.txt
  ```
- [ ] **Update settings.py** to use environment variables
- [ ] **Add .env to .gitignore**
- [ ] **Rotate all exposed credentials**
  - [ ] Generate new SECRET_KEY
  - [ ] Rotate Razorpay keys
  - [ ] Rotate Shiprocket credentials
  - [ ] Update database passwords

### Code Updates Required

- [ ] **Update all views** to use validators
- [ ] **Add CSRF protection** to all POST endpoints
- [ ] **Sanitize all user inputs** before saving
- [ ] **Use Django ORM** instead of raw SQL
- [ ] **Validate file uploads** (type, size, content)
- [ ] **Add rate limiting** to sensitive endpoints

---

## 📋 Remaining Security Tasks

### High Priority (Week 1)

1. **SQL Injection Prevention**
   - [ ] Replace raw SQL in `apps/products/utils.py`
   - [ ] Use parameterized queries everywhere
   - [ ] Add query validation

2. **XSS Prevention**
   - [ ] Escape all template outputs
   - [ ] Sanitize rich text fields
   - [ ] Use Django's built-in escaping

3. **Path Traversal Prevention**
   - [ ] Validate all file paths
   - [ ] Use safe file operations
   - [ ] Restrict file access to allowed directories

4. **CSRF Protection**
   - [ ] Enable CSRF middleware (already enabled)
   - [ ] Add @csrf_protect to views
   - [ ] Validate CSRF tokens on all POST requests

### Medium Priority (Week 2)

5. **Authentication Security**
   - [ ] Implement JWT refresh tokens
   - [ ] Add password complexity requirements
   - [ ] Implement account lockout after failed attempts
   - [ ] Add 2FA for admin accounts

6. **Authorization**
   - [ ] Review all permission classes
   - [ ] Implement role-based access control
   - [ ] Add object-level permissions

7. **Session Security**
   - [ ] Use secure session cookies
   - [ ] Implement session timeout
   - [ ] Add session invalidation on logout

### Low Priority (Week 3-4)

8. **Logging & Monitoring**
   - [ ] Log all security events
   - [ ] Set up Sentry for error tracking
   - [ ] Monitor failed login attempts
   - [ ] Alert on suspicious activity

9. **Data Protection**
   - [ ] Encrypt sensitive data at rest
   - [ ] Use HTTPS everywhere (production)
   - [ ] Implement data retention policies
   - [ ] Add GDPR compliance features

---

## 🛠️ Implementation Steps

### Step 1: Environment Setup (15 minutes)

```bash
# 1. Install dependencies
cd thrift-backend
pip install python-dotenv bleach argon2-cffi django-ratelimit

# 2. Create .env file
cp .env.example .env

# 3. Generate new SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# 4. Add to .env
echo "SECRET_KEY=<generated-key>" >> .env

# 5. Add Razorpay credentials
echo "RAZORPAY_KEY_ID=your-key-id" >> .env
echo "RAZORPAY_KEY_SECRET=your-key-secret" >> .env

# 6. Test
python manage.py check
```

### Step 2: Update Code (30 minutes)

```python
# Example: Update a view to use validators

from apps.common.validators import sanitize_html, validate_email

class UserRegistrationView(APIView):
    def post(self, request):
        # Sanitize inputs
        email = validate_email(request.data.get('email'))
        name = sanitize_html(request.data.get('name'))
        
        # ... rest of logic
```

### Step 3: Enable Middleware (5 minutes)

```python
# In settings.py
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.orders.middleware.RateLimitMiddleware',
    'apps.common.security_middleware.SecurityHeadersMiddleware',  # NEW
    'apps.common.security_middleware.InputSanitizationMiddleware',  # NEW
]
```

### Step 4: Test (15 minutes)

```bash
# 1. Run tests
python manage.py test

# 2. Check for security issues
python manage.py check --deploy

# 3. Test endpoints
curl -X POST http://localhost:8000/api/v1/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"<script>alert(1)</script>"}'

# Should sanitize the script tag
```

---

## 🔍 Security Testing

### Manual Tests

1. **XSS Test**
   ```bash
   # Try to inject script
   curl -X POST http://localhost:8000/api/v1/products/ \
     -d "title=<script>alert('XSS')</script>"
   
   # Should be sanitized
   ```

2. **SQL Injection Test**
   ```bash
   # Try SQL injection in search
   curl "http://localhost:8000/api/v1/products/?search='; DROP TABLE products;--"
   
   # Should be sanitized
   ```

3. **CSRF Test**
   ```bash
   # Try POST without CSRF token
   curl -X POST http://localhost:8000/api/v1/cart/add/ \
     -d "product_id=1"
   
   # Should return 403 Forbidden
   ```

### Automated Tests

```python
# tests/test_security.py

from django.test import TestCase
from apps.common.validators import sanitize_html

class SecurityTests(TestCase):
    def test_xss_prevention(self):
        malicious = "<script>alert('XSS')</script>"
        clean = sanitize_html(malicious)
        self.assertNotIn('<script>', clean)
    
    def test_sql_injection_prevention(self):
        malicious = "'; DROP TABLE products;--"
        clean = sanitize_search_query(malicious)
        self.assertNotIn(';', clean)
        self.assertNotIn('--', clean)
```

---

## 📊 Security Metrics

### Before Phase 4
- ❌ Hardcoded credentials: 5+
- ❌ XSS vulnerabilities: 10+
- ❌ SQL injection risks: 3+
- ❌ Path traversal risks: 8+
- ❌ CSRF protection: Partial

### After Phase 4 (Target)
- ✅ Hardcoded credentials: 0
- ✅ XSS vulnerabilities: 0
- ✅ SQL injection risks: 0
- ✅ Path traversal risks: 0
- ✅ CSRF protection: Complete

---

## 🚨 Emergency Response

### If Credentials Are Exposed

1. **Immediately rotate all credentials**
   ```bash
   # Generate new SECRET_KEY
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   
   # Update .env
   # Restart server
   ```

2. **Check for unauthorized access**
   - Review server logs
   - Check database for suspicious activity
   - Monitor payment gateway for unauthorized transactions

3. **Notify affected parties**
   - Inform users if data was compromised
   - Contact payment gateway
   - File incident report

---

## ✅ Verification Checklist

- [ ] All credentials in environment variables
- [ ] .env file in .gitignore
- [ ] No hardcoded secrets in code
- [ ] Input validation on all endpoints
- [ ] Security middleware enabled
- [ ] CSRF protection working
- [ ] XSS prevention tested
- [ ] SQL injection prevention tested
- [ ] Security headers present
- [ ] HTTPS enforced (production)

---

**Status**: 🟡 IN PROGRESS
**Priority**: 🔴 CRITICAL
**Timeline**: Week 1 of Phase 4
**Owner**: Backend Security Team

