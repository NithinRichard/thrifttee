#!/usr/bin/env python
"""
Test runner script with coverage reporting
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'thrift_shop.settings')
django.setup()

from django.core.management import call_command
from django.test.utils import get_runner
from django.conf import settings

def run_tests():
    """Run tests with coverage"""
    print("\n" + "="*60)
    print("RUNNING TESTS")
    print("="*60 + "\n")
    
    # Run tests
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=True, keepdb=False)
    
    failures = test_runner.run_tests([
        'apps.orders.tests',
        'apps.products.tests',
        'apps.cart.tests',
    ])
    
    print("\n" + "="*60)
    if failures:
        print(f"TESTS FAILED: {failures} failure(s)")
    else:
        print("ALL TESTS PASSED!")
    print("="*60 + "\n")
    
    sys.exit(bool(failures))

if __name__ == '__main__':
    run_tests()
