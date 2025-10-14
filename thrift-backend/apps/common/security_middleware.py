from django.http import HttpResponseForbidden
from django.utils.deprecation import MiddlewareMixin
import re

class SecurityHeadersMiddleware(MiddlewareMixin):
    """Add security headers to all responses"""
    
    def process_response(self, request, response):
        # Prevent clickjacking
        response['X-Frame-Options'] = 'DENY'
        
        # Prevent MIME type sniffing
        response['X-Content-Type-Options'] = 'nosniff'
        
        # Enable XSS protection
        response['X-XSS-Protection'] = '1; mode=block'
        
        # Strict Transport Security (HTTPS only)
        if not request.is_secure() and not request.get_host().startswith('localhost'):
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        # Content Security Policy
        response['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https://api.razorpay.com;"
        )
        
        return response

class InputSanitizationMiddleware(MiddlewareMixin):
    """Sanitize all user inputs"""
    
    DANGEROUS_PATTERNS = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'on\w+\s*=',
        r'<iframe',
        r'<object',
        r'<embed',
    ]
    
    def process_request(self, request):
        if request.method in ['POST', 'PUT', 'PATCH']:
            self._sanitize_data(request.POST)
            if hasattr(request, 'data'):
                self._sanitize_data(request.data)
        return None
    
    def _sanitize_data(self, data):
        """Check for dangerous patterns in data"""
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, str):
                    for pattern in self.DANGEROUS_PATTERNS:
                        if re.search(pattern, value, re.IGNORECASE):
                            return HttpResponseForbidden('Malicious input detected')
