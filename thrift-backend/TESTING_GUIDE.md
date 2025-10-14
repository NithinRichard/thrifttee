# Testing & Quality Assurance Guide

## Test Suite Overview

### Test Files Created
1. `apps/orders/tests.py` - Order API and model tests
2. `apps/products/tests.py` - Product API and validator tests
3. `apps/cart/tests.py` - Cart API tests
4. `run_tests.py` - Test runner with coverage

## Test Categories

### 1. Unit Tests
**Purpose:** Test individual components in isolation

**Coverage:**
- Model creation and validation
- Validator functions (sanitize_html, validate_email, validate_phone)
- Business logic methods

**Examples:**
```python
def test_order_creation(self):
    order = Order.objects.create(...)
    self.assertEqual(order.status, 'pending')

def test_sanitize_html(self):
    clean = sanitize_html('<script>alert("XSS")</script>')
    self.assertNotIn('<script>', clean)
```

### 2. Integration Tests
**Purpose:** Test API endpoints and workflows

**Coverage:**
- Authentication and authorization
- CRUD operations
- Payment flow
- Cart operations
- Admin operations

**Examples:**
```python
def test_add_to_cart(self):
    self.client.force_authenticate(user=self.user)
    response = self.client.post('/api/cart/add/', {...})
    self.assertEqual(response.status_code, 200)
```

### 3. E2E Tests (Manual)
**Purpose:** Test complete user workflows

**Scenarios:**
1. Browse products → Add to cart → Checkout → Payment
2. User registration → Login → Place order
3. Admin login → View analytics → Update orders

## Running Tests

### All Tests
```bash
cd thrift-backend
python manage.py test
```

### Specific App
```bash
python manage.py test apps.orders
python manage.py test apps.products
python manage.py test apps.cart
```

### With Verbosity
```bash
python manage.py test --verbosity=2
```

### Keep Test Database
```bash
python manage.py test --keepdb
```

## Test Coverage

### Install Coverage Tool
```bash
pip install coverage
```

### Run with Coverage
```bash
coverage run --source='.' manage.py test
coverage report
coverage html
```

### View HTML Report
```bash
# Open htmlcov/index.html in browser
```

## Test Cases Implemented

### Order Tests (apps/orders/tests.py)
- ✅ Create order (authenticated)
- ✅ Create order (unauthenticated) - should fail
- ✅ Admin analytics access
- ✅ Admin analytics (non-admin) - should fail
- ✅ Bulk update orders
- ✅ Export CSV
- ✅ Order model creation
- ✅ Order string representation

### Product Tests (apps/products/tests.py)
- ✅ List products
- ✅ Get product detail
- ✅ Search products
- ✅ HTML sanitization
- ✅ Email validation
- ✅ Phone validation

### Cart Tests (apps/cart/tests.py)
- ✅ Add to cart (authenticated)
- ✅ Add to cart (unauthenticated) - should fail
- ✅ Get cart
- ✅ Update cart quantity

## Test Data Setup

### Fixtures
Create test data in `setUp()` method:
```python
def setUp(self):
    self.user = User.objects.create_user(...)
    self.product = TShirt.objects.create(...)
    self.client = APIClient()
```

### Authentication
```python
self.client.force_authenticate(user=self.user)
```

## Assertions Used

### Status Codes
```python
self.assertEqual(response.status_code, 200)
self.assertEqual(response.status_code, status.HTTP_200_OK)
```

### Data Validation
```python
self.assertIn('stats', response.data)
self.assertEqual(order.status, 'processing')
self.assertNotIn('<script>', clean_html)
```

### Exceptions
```python
with self.assertRaises(ValidationError):
    validate_email('invalid')
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run tests
        run: python manage.py test
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `setUp()` and `tearDown()`
- Don't rely on test execution order

### 2. Descriptive Names
```python
def test_admin_cannot_access_without_permission(self):
    # Clear test purpose
```

### 3. Arrange-Act-Assert
```python
def test_example(self):
    # Arrange
    user = User.objects.create(...)
    
    # Act
    response = self.client.post(...)
    
    # Assert
    self.assertEqual(response.status_code, 200)
```

### 4. Mock External Services
```python
from unittest.mock import patch

@patch('razorpay.Client')
def test_payment(self, mock_razorpay):
    mock_razorpay.return_value.order.create.return_value = {...}
```

## Test Checklist

### API Endpoints
- [ ] Authentication required endpoints
- [ ] Public endpoints
- [ ] Admin-only endpoints
- [ ] Invalid input handling
- [ ] Error responses

### Models
- [ ] Model creation
- [ ] Field validation
- [ ] Model methods
- [ ] String representation

### Business Logic
- [ ] Validators
- [ ] Calculations
- [ ] State transitions
- [ ] Edge cases

## Common Issues

### Issue: ModuleNotFoundError
**Solution:** Install missing dependencies
```bash
pip install -r requirements.txt
```

### Issue: Database errors
**Solution:** Run migrations
```bash
python manage.py migrate
```

### Issue: Test database not cleaned
**Solution:** Use `--keepdb` flag or restart tests

## Performance Testing

### Load Testing with Locust
```python
from locust import HttpUser, task

class WebsiteUser(HttpUser):
    @task
    def view_products(self):
        self.client.get("/api/products/")
```

## Security Testing

### Test Cases
- [ ] SQL injection attempts
- [ ] XSS attempts
- [ ] CSRF protection
- [ ] Authentication bypass
- [ ] Authorization checks

## Test Metrics

### Target Coverage
- Unit Tests: 80%+
- Integration Tests: 70%+
- Overall: 75%+

### Current Status
- Total Tests: 18
- Passing: TBD (run tests)
- Coverage: TBD (run coverage)

## Next Steps

1. **Install Dependencies:**
   ```bash
   pip install coverage pytest pytest-django
   ```

2. **Run Tests:**
   ```bash
   python manage.py test
   ```

3. **Generate Coverage:**
   ```bash
   coverage run manage.py test
   coverage report
   ```

4. **Add More Tests:**
   - Payment flow integration
   - Shipping calculations
   - Email notifications
   - File uploads

5. **Set Up CI/CD:**
   - Configure GitHub Actions
   - Add test badges
   - Automated testing on PR

---

**Status:** ✅ Test suite created and ready to run
**Total Tests:** 18 test cases across 3 apps
**Next:** Run tests and achieve 75%+ coverage
