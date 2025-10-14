"""
Security Headers Test
Tests that security headers are properly set on responses
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
django.setup()

from django.test import RequestFactory
from apps.common.security_middleware import SecurityHeadersMiddleware

def test_security_headers():
    """Test that security headers are added to responses"""
    print("\n" + "="*60)
    print("SECURITY HEADERS TEST")
    print("="*60)
    
    # Create a mock request and response
    factory = RequestFactory()
    request = factory.get('/', HTTP_HOST='localhost')
    
    # Create a mock response
    from django.http import HttpResponse
    response = HttpResponse("Test")
    
    # Apply middleware
    middleware = SecurityHeadersMiddleware(lambda r: response)
    # Mock is_secure to avoid HSTS check
    request.is_secure = lambda: True
    response = middleware.process_response(request, response)
    
    # Expected headers
    expected_headers = {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Content-Security-Policy': None,  # Just check it exists
    }
    
    passed = 0
    failed = 0
    
    print("\nChecking security headers:")
    for header, expected_value in expected_headers.items():
        if header in response:
            actual_value = response[header]
            if expected_value is None or actual_value == expected_value:
                print(f"[PASS] {header} = {actual_value}")
                passed += 1
            else:
                print(f"[FAIL] {header} = {actual_value} (expected: {expected_value})")
                failed += 1
        else:
            print(f"[FAIL] {header} is missing")
            failed += 1
    
    print(f"\nSecurity Headers: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("\nALL SECURITY HEADERS PRESENT!")
    else:
        print("\nSOME SECURITY HEADERS MISSING")
    
    return failed == 0

if __name__ == "__main__":
    test_security_headers()
