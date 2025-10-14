"""
Security Features Test Suite
Tests XSS prevention, SQL injection protection, validation, and security headers
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
django.setup()

from apps.common.validators import (
    sanitize_html, sanitize_search_query, 
    validate_email, validate_phone, validate_pincode, validate_quantity
)
from django.core.exceptions import ValidationError

def test_xss_prevention():
    """Test XSS prevention through HTML sanitization"""
    print("\n" + "="*60)
    print("TEST 1: XSS PREVENTION")
    print("="*60)
    
    test_cases = [
        ("<script>alert('XSS')</script>", "alert('XSS')"),  # Tags removed, content kept
        ("Hello<script>alert('XSS')</script>World", "Helloalert('XSS')World"),  # Tags removed
        ("<img src=x onerror=alert('XSS')>", ""),
        ("Normal text", "Normal text"),
        ("<b>Bold</b> text", "Bold text"),
        ("javascript:alert('XSS')", "javascript:alert('XSS')"),
        ("<iframe src='evil.com'></iframe>", ""),
    ]
    
    passed = 0
    failed = 0
    
    for input_text, expected in test_cases:
        result = sanitize_html(input_text)
        if result == expected:
            print(f"[PASS] '{input_text[:50]}' -> '{result}'")
            passed += 1
        else:
            print(f"[FAIL] '{input_text[:50]}' -> Expected: '{expected}', Got: '{result}'")
            failed += 1
    
    print(f"\nXSS Prevention: {passed} passed, {failed} failed")
    return failed == 0

def test_sql_injection_protection():
    """Test SQL injection protection in search queries"""
    print("\n" + "="*60)
    print("TEST 2: SQL INJECTION PROTECTION")
    print("="*60)
    
    test_cases = [
        ("'; DROP TABLE products; --", " DROP TABLE products --"),
        ("normal search", "normal search"),
        ("search' OR '1'='1", "search OR 11"),
        ("test\"; DELETE FROM users; --", "test DELETE FROM users --"),
        ("valid-search-123", "valid-search-123"),
    ]
    
    passed = 0
    failed = 0
    
    for input_query, expected in test_cases:
        result = sanitize_search_query(input_query)
        # Check that dangerous characters are removed
        has_dangerous = any(char in result for char in [';', '"', "'", '\\'])
        if not has_dangerous:
            print(f"[PASS] '{input_query[:50]}' -> '{result}' (safe)")
            passed += 1
        else:
            print(f"[FAIL] '{input_query[:50]}' -> '{result}' (still has dangerous chars)")
            failed += 1
    
    print(f"\nSQL Injection Protection: {passed} passed, {failed} failed")
    return failed == 0

def test_email_validation():
    """Test email validation"""
    print("\n" + "="*60)
    print("TEST 3: EMAIL VALIDATION")
    print("="*60)
    
    valid_emails = [
        "user@example.com",
        "test.user@domain.co.in",
        "admin@test.org",
    ]
    
    invalid_emails = [
        "invalid",
        "test@",
        "@domain.com",
        "test@domain",
        "test..user@domain.com",
    ]
    
    passed = 0
    failed = 0
    
    print("\nValid emails:")
    for email in valid_emails:
        try:
            result = validate_email(email)
            print(f"[PASS] '{email}' -> '{result}'")
            passed += 1
        except ValidationError as e:
            print(f"[FAIL] '{email}' should be valid but got error: {e}")
            failed += 1
    
    print("\nInvalid emails:")
    for email in invalid_emails:
        try:
            result = validate_email(email)
            print(f"[FAIL] '{email}' should be invalid but passed: '{result}'")
            failed += 1
        except ValidationError:
            print(f"[PASS] '{email}' correctly rejected")
            passed += 1
    
    print(f"\nEmail Validation: {passed} passed, {failed} failed")
    return failed == 0

def test_phone_validation():
    """Test phone number validation"""
    print("\n" + "="*60)
    print("TEST 4: PHONE VALIDATION")
    print("="*60)
    
    valid_phones = [
        "9876543210",
        "+919876543210",
        "919876543210",
        "8765432109",
    ]
    
    invalid_phones = [
        "123",
        "abcdefghij",
        "1234567890",  # Doesn't start with 6-9
        "98765",  # Too short
        "98765432109876",  # Too long
    ]
    
    passed = 0
    failed = 0
    
    print("\nValid phones:")
    for phone in valid_phones:
        try:
            result = validate_phone(phone)
            print(f"[PASS] '{phone}' -> '{result}'")
            passed += 1
        except ValidationError as e:
            print(f"[FAIL] '{phone}' should be valid but got error: {e}")
            failed += 1
    
    print("\nInvalid phones:")
    for phone in invalid_phones:
        try:
            result = validate_phone(phone)
            print(f"[FAIL] '{phone}' should be invalid but passed: '{result}'")
            failed += 1
        except ValidationError:
            print(f"[PASS] '{phone}' correctly rejected")
            passed += 1
    
    print(f"\nPhone Validation: {passed} passed, {failed} failed")
    return failed == 0

def test_pincode_validation():
    """Test pincode validation"""
    print("\n" + "="*60)
    print("TEST 5: PINCODE VALIDATION")
    print("="*60)
    
    valid_pincodes = [
        "110001",
        "400001",
        "560001",
        "700001",
    ]
    
    invalid_pincodes = [
        "123",
        "12345",
        "1234567",
        "abcdef",
        "11000a",
    ]
    
    passed = 0
    failed = 0
    
    print("\nValid pincodes:")
    for pincode in valid_pincodes:
        try:
            result = validate_pincode(pincode)
            print(f"[PASS] '{pincode}' -> '{result}'")
            passed += 1
        except ValidationError as e:
            print(f"[FAIL] '{pincode}' should be valid but got error: {e}")
            failed += 1
    
    print("\nInvalid pincodes:")
    for pincode in invalid_pincodes:
        try:
            result = validate_pincode(pincode)
            print(f"[FAIL] '{pincode}' should be invalid but passed: '{result}'")
            failed += 1
        except ValidationError:
            print(f"[PASS] '{pincode}' correctly rejected")
            passed += 1
    
    print(f"\nPincode Validation: {passed} passed, {failed} failed")
    return failed == 0

def test_quantity_validation():
    """Test quantity validation"""
    print("\n" + "="*60)
    print("TEST 6: QUANTITY VALIDATION")
    print("="*60)
    
    valid_quantities = [1, 5, 10, 50, 100]
    invalid_quantities = [0, -1, 101, 1000, "abc", None]
    
    passed = 0
    failed = 0
    
    print("\nValid quantities:")
    for qty in valid_quantities:
        try:
            result = validate_quantity(qty)
            print(f"[PASS] {qty} -> {result}")
            passed += 1
        except ValidationError as e:
            print(f"[FAIL] {qty} should be valid but got error: {e}")
            failed += 1
    
    print("\nInvalid quantities:")
    for qty in invalid_quantities:
        try:
            result = validate_quantity(qty)
            print(f"[FAIL] {qty} should be invalid but passed: {result}")
            failed += 1
        except ValidationError:
            print(f"[PASS] {qty} correctly rejected")
            passed += 1
    
    print(f"\nQuantity Validation: {passed} passed, {failed} failed")
    return failed == 0

def main():
    """Run all security tests"""
    print("\n" + "="*60)
    print("SECURITY FEATURES TEST SUITE")
    print("="*60)
    
    results = {
        "XSS Prevention": test_xss_prevention(),
        "SQL Injection Protection": test_sql_injection_protection(),
        "Email Validation": test_email_validation(),
        "Phone Validation": test_phone_validation(),
        "Pincode Validation": test_pincode_validation(),
        "Quantity Validation": test_quantity_validation(),
    }
    
    print("\n" + "="*60)
    print("FINAL RESULTS")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "[PASSED]" if passed else "[FAILED]"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + "="*60)
    if all_passed:
        print("ALL SECURITY TESTS PASSED!")
    else:
        print("SOME SECURITY TESTS FAILED - REVIEW ABOVE")
    print("="*60 + "\n")
    
    return all_passed

if __name__ == "__main__":
    main()
