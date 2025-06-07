import requests
import unittest
import json
import sys
from datetime import datetime

class ShopEasyAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers)
            
            status_match = response.status_code == expected_status
            
            if status_match:
                self.tests_passed += 1
                result = "✅ PASSED"
                print(f"✅ Passed - Status: {response.status_code}")
            else:
                result = "❌ FAILED"
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
            
            response_data = None
            try:
                response_data = response.json()
                print(f"Response: {json.dumps(response_data, indent=2)}")
            except:
                print(f"Response: {response.text}")
            
            self.test_results.append({
                "name": name,
                "result": result,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "response": response_data
            })
            
            return status_match, response
            
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "result": "❌ FAILED",
                "error": str(e)
            })
            return False, None

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*50)
        print(f"📊 TEST SUMMARY: {self.tests_passed}/{self.tests_run} tests passed")
        print("="*50)
        
        for test in self.test_results:
            print(f"{test['result']} - {test['name']}")
        
        print("="*50)
        return self.tests_passed == self.tests_run

def main():
    # Get the backend URL from frontend .env
    backend_url = "https://a43f9702-4f59-4e85-b638-7aba5e9627ca.preview.emergentagent.com"
    
    print(f"Testing ShopEasy API at: {backend_url}")
    tester = ShopEasyAPITester(backend_url)
    
    # Test 1: Health Check
    tester.run_test(
        "Health Check Endpoint",
        "GET",
        "api/health",
        200
    )
    
    # Test 2: Test Connections
    tester.run_test(
        "Test Connections Endpoint",
        "GET",
        "api/test-connections",
        200
    )
    
    # Test 3: Submit Order
    test_order = {
        "customer_name": "Test Customer",
        "customer_email": "test@example.com",
        "customer_phone": "1234567890",
        "customer_address": "123 Test Street, Test City, Test Country",
        "product_id": 1,
        "product_name": "Professional Makeup Kit",
        "product_category": "Make up kits",
        "product_price": "₹2,500",
        "selected_color": "Natural",
        "selected_size": "Standard",
        "quantity": 1,
        "notes": "This is a test order",
        "honeypot": ""  # Should be empty for spam protection
    }
    
    tester.run_test(
        "Submit Order",
        "POST",
        "api/orders",
        200,  # Expecting success even with placeholder credentials
        data=test_order
    )
    
    # Test 4: Submit Order with filled honeypot (should be rejected)
    spam_order = test_order.copy()
    spam_order["honeypot"] = "spam"
    
    tester.run_test(
        "Submit Order with Spam Protection (should fail)",
        "POST",
        "api/orders",
        422,  # Expecting validation error
        data=spam_order
    )
    
    # Test 5: Get orders
    tester.run_test(
        "Get Orders",
        "GET",
        "api/orders",
        200
    )
    
    # Print summary
    success = tester.print_summary()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
