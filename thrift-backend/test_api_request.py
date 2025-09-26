import requests
import json

# Test the API with the exact format
url = "http://localhost:8000/api/v1/products/shipping/calculate/"

# Test data
data = {
    "items": [
        {"product_id": 1, "quantity": 1}
    ],
    "shipping_address": {
        "postal_code": "110001",
        "state": "DL", 
        "country": "IN"
    }
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 400:
        print("400 Error - Bad Request")
        print("Response JSON:", response.json())
        
except Exception as e:
    print(f"Request failed: {e}")