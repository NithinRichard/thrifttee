from django.core.cache import cache
from django.http import JsonResponse
import time

class RateLimitMiddleware:
    """Rate limiting middleware to prevent API abuse."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limits = {
            '/api/orders/create/': (5, 60),  # 5 requests per minute
            '/api/payment/': (10, 60),  # 10 requests per minute
            '/api/auth/': (10, 300),  # 10 requests per 5 minutes
        }
    
    def __call__(self, request):
        if request.path.startswith('/api/'):
            client_ip = self.get_client_ip(request)
            
            for path_prefix, (limit, window) in self.rate_limits.items():
                if request.path.startswith(path_prefix):
                    if not self.check_rate_limit(client_ip, path_prefix, limit, window):
                        return JsonResponse({
                            'error': 'Rate limit exceeded. Please try again later.'
                        }, status=429)
        
        response = self.get_response(request)
        return response
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')
    
    def check_rate_limit(self, client_ip, path, limit, window):
        cache_key = f'rate_limit:{client_ip}:{path}'
        requests = cache.get(cache_key, [])
        now = time.time()
        
        # Remove old requests outside the window
        requests = [req_time for req_time in requests if now - req_time < window]
        
        if len(requests) >= limit:
            return False
        
        requests.append(now)
        cache.set(cache_key, requests, window)
        return True
