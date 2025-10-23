import requests
import sys
import json
from datetime import datetime, timedelta

class BrecklandHeatingEdgeCaseTests:
    def __init__(self, base_url="https://unified-repos.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        
    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")

    def make_request(self, method, endpoint, data=None, token=None, expected_status=None):
        """Make HTTP request with proper error handling"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, headers=headers, params=data if data else None)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            
            if expected_status and response.status_code != expected_status:
                return False, f"Expected {expected_status}, got {response.status_code}: {response.text}"
            
            try:
                return True, response.json()
            except:
                return True, response.text
                
        except Exception as e:
            return False, f"Request failed: {str(e)}"

    def setup_admin_user(self):
        """Create admin user for testing"""
        timestamp = datetime.now().strftime("%H%M%S")
        user_data = {
            "email": f"edge_admin_{timestamp}@brecklandheating.com",
            "password": "AdminPass123!",
            "name": f"Edge Admin {timestamp}",
            "role": "admin"
        }
        
        success, result = self.make_request('POST', 'auth/register', user_data, expected_status=200)
        if success and 'token' in result:
            self.admin_token = result['token']
            return True
        return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_credentials = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        success, result = self.make_request('POST', 'auth/login', invalid_credentials, expected_status=401)
        if not success and "401" in str(result):
            self.log_test("Invalid login credentials", True)
            return True
        else:
            self.log_test("Invalid login credentials", False, "Should return 401 for invalid credentials")
            return False

    def test_duplicate_user_registration(self):
        """Test registering user with existing email"""
        user_data = {
            "email": "duplicate@brecklandheating.com",
            "password": "Password123!",
            "name": "First User",
            "role": "staff"
        }
        
        # Register first user
        success1, result1 = self.make_request('POST', 'auth/register', user_data, expected_status=200)
        
        # Try to register same email again
        success2, result2 = self.make_request('POST', 'auth/register', user_data, expected_status=400)
        
        if success1 and not success2 and "400" in str(result2):
            self.log_test("Duplicate email registration prevention", True)
            return True
        else:
            self.log_test("Duplicate email registration prevention", False, "Should prevent duplicate email registration")
            return False

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        success, result = self.make_request('GET', 'customers', expected_status=401)
        if not success and "401" in str(result):
            self.log_test("Unauthorized access protection", True)
            return True
        else:
            self.log_test("Unauthorized access protection", False, "Should require authentication")
            return False

    def test_invalid_customer_id(self):
        """Test accessing non-existent customer"""
        success, result = self.make_request('GET', 'customers/invalid-id-12345', token=self.admin_token, expected_status=404)
        if not success and "404" in str(result):
            self.log_test("Invalid customer ID handling", True)
            return True
        else:
            self.log_test("Invalid customer ID handling", False, "Should return 404 for non-existent customer")
            return False

    def test_invalid_invoice_data(self):
        """Test creating invoice with invalid customer ID"""
        invalid_invoice_data = {
            "customer_id": "non-existent-customer-id",
            "items": [{
                "service_id": "test-service",
                "service_name": "Test Service",
                "description": "Test",
                "quantity": 1,
                "price": 100.0,
                "total": 100.0
            }],
            "issue_date": datetime.now().isoformat(),
            "vat_rate": 20.0
        }
        
        success, result = self.make_request('POST', 'invoices', invalid_invoice_data, token=self.admin_token, expected_status=404)
        if not success and "404" in str(result):
            self.log_test("Invalid invoice customer ID handling", True)
            return True
        else:
            self.log_test("Invalid invoice customer ID handling", False, "Should return 404 for non-existent customer")
            return False

    def test_invalid_invoice_status_update(self):
        """Test updating invoice status with invalid status"""
        # First create a valid invoice
        customer_data = {
            "name": "Edge Test Customer",
            "address": "123 Edge Street",
            "phone": "01234 567890"
        }
        
        success, customer = self.make_request('POST', 'customers', customer_data, token=self.admin_token)
        if not success:
            self.log_test("Invalid invoice status update", False, "Could not create test customer")
            return False
            
        service_data = {
            "name": "Edge Test Service",
            "price": 50.0
        }
        
        success, service = self.make_request('POST', 'services', service_data, token=self.admin_token)
        if not success:
            self.log_test("Invalid invoice status update", False, "Could not create test service")
            return False
            
        invoice_data = {
            "customer_id": customer['id'],
            "items": [{
                "service_id": service['id'],
                "service_name": service['name'],
                "quantity": 1,
                "price": 50.0,
                "total": 50.0
            }],
            "issue_date": datetime.now().isoformat(),
            "vat_rate": 20.0
        }
        
        success, invoice = self.make_request('POST', 'invoices', invoice_data, token=self.admin_token)
        if not success:
            self.log_test("Invalid invoice status update", False, "Could not create test invoice")
            return False
            
        # Now test invalid status update
        success, result = self.make_request('PATCH', f'invoices/{invoice["id"]}/status', {'status': 'invalid_status'}, token=self.admin_token, expected_status=400)
        if not success and "400" in str(result):
            self.log_test("Invalid invoice status update", True)
            return True
        else:
            self.log_test("Invalid invoice status update", False, "Should reject invalid status values")
            return False

    def test_convert_already_converted_estimate(self):
        """Test converting an estimate that's already been converted"""
        # Create customer and service first
        customer_data = {
            "name": "Convert Test Customer",
            "address": "123 Convert Street",
            "phone": "01234 567890"
        }
        
        success, customer = self.make_request('POST', 'customers', customer_data, token=self.admin_token)
        if not success:
            self.log_test("Convert already converted estimate", False, "Could not create test customer")
            return False
            
        service_data = {
            "name": "Convert Test Service",
            "price": 75.0
        }
        
        success, service = self.make_request('POST', 'services', service_data, token=self.admin_token)
        if not success:
            self.log_test("Convert already converted estimate", False, "Could not create test service")
            return False
            
        estimate_data = {
            "customer_id": customer['id'],
            "items": [{
                "service_id": service['id'],
                "service_name": service['name'],
                "quantity": 1,
                "price": 75.0,
                "total": 75.0
            }],
            "issue_date": datetime.now().isoformat(),
            "vat_rate": 20.0
        }
        
        success, estimate = self.make_request('POST', 'estimates', estimate_data, token=self.admin_token)
        if not success:
            self.log_test("Convert already converted estimate", False, "Could not create test estimate")
            return False
            
        # Convert estimate first time
        success, result1 = self.make_request('POST', f'estimates/{estimate["id"]}/convert', token=self.admin_token)
        if not success:
            self.log_test("Convert already converted estimate", False, "First conversion failed")
            return False
            
        # Try to convert again
        success, result2 = self.make_request('POST', f'estimates/{estimate["id"]}/convert', token=self.admin_token, expected_status=400)
        if not success and "400" in str(result2):
            self.log_test("Convert already converted estimate", True)
            return True
        else:
            self.log_test("Convert already converted estimate", False, "Should prevent double conversion")
            return False

    def run_edge_case_tests(self):
        """Run all edge case tests"""
        print("🔍 Starting Breckland Heating Edge Case Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Setup admin user
        if not self.setup_admin_user():
            print("❌ Could not create admin user for testing")
            return False
            
        # Run edge case tests
        self.test_invalid_login()
        self.test_duplicate_user_registration()
        self.test_unauthorized_access()
        self.test_invalid_customer_id()
        self.test_invalid_invoice_data()
        self.test_invalid_invoice_status_update()
        self.test_convert_already_converted_estimate()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Edge Case Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All edge case tests passed!")
            return True
        else:
            print("⚠️  Some edge case tests failed. Check the details above.")
            return False

def main():
    tester = BrecklandHeatingEdgeCaseTests()
    success = tester.run_edge_case_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())