import requests
import sys
import json
from datetime import datetime, timedelta

class BrecklandHeatingAPITester:
    def __init__(self, base_url="https://unified-repos.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.staff_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data storage
        self.test_customer_id = None
        self.test_service_id = None
        self.test_invoice_id = None
        self.test_estimate_id = None
        self.test_certificate_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

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
            
            if response.status_code >= 400:
                return False, f"HTTP {response.status_code}: {response.text}"
            
            try:
                return True, response.json()
            except:
                return True, response.text
                
        except Exception as e:
            return False, f"Request failed: {str(e)}"

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, result = self.make_request('GET', '', expected_status=200)
        if success and isinstance(result, dict) and 'message' in result:
            self.log_test("Root endpoint", True)
            return True
        else:
            self.log_test("Root endpoint", False, str(result))
            return False

    def test_user_registration_admin(self):
        """Test admin user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        user_data = {
            "email": f"admin_{timestamp}@brecklandheating.com",
            "password": "AdminPass123!",
            "name": f"Admin User {timestamp}",
            "role": "admin"
        }
        
        success, result = self.make_request('POST', 'auth/register', user_data, expected_status=200)
        if success and 'token' in result:
            self.admin_token = result['token']
            self.log_test("Admin registration", True)
            return True
        else:
            self.log_test("Admin registration", False, str(result))
            return False

    def test_user_registration_staff(self):
        """Test staff user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        user_data = {
            "email": f"staff_{timestamp}@brecklandheating.com",
            "password": "StaffPass123!",
            "name": f"Staff User {timestamp}",
            "role": "staff"
        }
        
        success, result = self.make_request('POST', 'auth/register', user_data, expected_status=200)
        if success and 'token' in result:
            self.staff_token = result['token']
            self.log_test("Staff registration", True)
            return True
        else:
            self.log_test("Staff registration", False, str(result))
            return False

    def test_auth_me(self):
        """Test getting current user info"""
        success, result = self.make_request('GET', 'auth/me', token=self.admin_token, expected_status=200)
        if success and 'email' in result and 'role' in result:
            self.log_test("Get current user", True)
            return True
        else:
            self.log_test("Get current user", False, str(result))
            return False

    def test_create_customer(self):
        """Test customer creation with auto-numbering"""
        customer_data = {
            "name": "Test Customer Ltd",
            "address": "123 Test Street, Norwich, NR1 1AA",
            "phone": "01234 567890",
            "email": "test@customer.com"
        }
        
        success, result = self.make_request('POST', 'customers', customer_data, token=self.admin_token, expected_status=200)
        if success and 'customer_number' in result and result['customer_number'].startswith('C'):
            self.test_customer_id = result['id']
            self.log_test("Create customer with auto-numbering", True)
            return True
        else:
            self.log_test("Create customer with auto-numbering", False, str(result))
            return False

    def test_get_customers(self):
        """Test getting all customers"""
        success, result = self.make_request('GET', 'customers', token=self.admin_token, expected_status=200)
        if success and isinstance(result, list) and len(result) > 0:
            self.log_test("Get customers list", True)
            return True
        else:
            self.log_test("Get customers list", False, str(result))
            return False

    def test_update_customer(self):
        """Test customer update"""
        if not self.test_customer_id:
            self.log_test("Update customer", False, "No customer ID available")
            return False
            
        update_data = {
            "name": "Updated Test Customer Ltd",
            "address": "456 Updated Street, Norwich, NR2 2BB",
            "phone": "01234 999888",
            "email": "updated@customer.com"
        }
        
        success, result = self.make_request('PUT', f'customers/{self.test_customer_id}', update_data, token=self.admin_token, expected_status=200)
        if success and result.get('name') == update_data['name']:
            self.log_test("Update customer", True)
            return True
        else:
            self.log_test("Update customer", False, str(result))
            return False

    def test_create_service(self):
        """Test service creation"""
        service_data = {
            "name": "Boiler Service",
            "description": "Annual boiler maintenance and safety check",
            "price": 89.99
        }
        
        success, result = self.make_request('POST', 'services', service_data, token=self.admin_token, expected_status=200)
        if success and 'id' in result and result['price'] == service_data['price']:
            self.test_service_id = result['id']
            self.log_test("Create service", True)
            return True
        else:
            self.log_test("Create service", False, str(result))
            return False

    def test_get_services(self):
        """Test getting all services"""
        success, result = self.make_request('GET', 'services', token=self.admin_token, expected_status=200)
        if success and isinstance(result, list) and len(result) > 0:
            self.log_test("Get services list", True)
            return True
        else:
            self.log_test("Get services list", False, str(result))
            return False

    def test_create_invoice(self):
        """Test invoice creation with auto-numbering"""
        if not self.test_customer_id or not self.test_service_id:
            self.log_test("Create invoice", False, "Missing customer or service ID")
            return False
            
        invoice_data = {
            "customer_id": self.test_customer_id,
            "items": [{
                "service_id": self.test_service_id,
                "service_name": "Boiler Service",
                "description": "Annual boiler maintenance",
                "quantity": 1,
                "price": 89.99,
                "total": 89.99
            }],
            "issue_date": datetime.now().isoformat(),
            "due_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "notes": "Test invoice",
            "vat_rate": 20.0
        }
        
        success, result = self.make_request('POST', 'invoices', invoice_data, token=self.admin_token, expected_status=200)
        if success and 'invoice_number' in result and result['invoice_number'].startswith('INV'):
            self.test_invoice_id = result['id']
            self.log_test("Create invoice with auto-numbering", True)
            return True
        else:
            self.log_test("Create invoice with auto-numbering", False, str(result))
            return False

    def test_get_invoices(self):
        """Test getting all invoices"""
        success, result = self.make_request('GET', 'invoices', token=self.admin_token, expected_status=200)
        if success and isinstance(result, list) and len(result) > 0:
            self.log_test("Get invoices list", True)
            return True
        else:
            self.log_test("Get invoices list", False, str(result))
            return False

    def test_update_invoice_status(self):
        """Test invoice status update"""
        if not self.test_invoice_id:
            self.log_test("Update invoice status", False, "No invoice ID available")
            return False
            
        success, result = self.make_request('PATCH', f'invoices/{self.test_invoice_id}/status', {'status': 'paid'}, token=self.admin_token, expected_status=200)
        if success:
            self.log_test("Update invoice status", True)
            return True
        else:
            self.log_test("Update invoice status", False, str(result))
            return False

    def test_create_estimate(self):
        """Test estimate creation with auto-numbering"""
        if not self.test_customer_id or not self.test_service_id:
            self.log_test("Create estimate", False, "Missing customer or service ID")
            return False
            
        estimate_data = {
            "customer_id": self.test_customer_id,
            "items": [{
                "service_id": self.test_service_id,
                "service_name": "Boiler Service",
                "description": "Annual boiler maintenance",
                "quantity": 1,
                "price": 89.99,
                "total": 89.99
            }],
            "issue_date": datetime.now().isoformat(),
            "valid_until": (datetime.now() + timedelta(days=30)).isoformat(),
            "notes": "Test estimate",
            "vat_rate": 20.0
        }
        
        success, result = self.make_request('POST', 'estimates', estimate_data, token=self.admin_token, expected_status=200)
        if success and 'estimate_number' in result and result['estimate_number'].startswith('EST'):
            self.test_estimate_id = result['id']
            self.log_test("Create estimate with auto-numbering", True)
            return True
        else:
            self.log_test("Create estimate with auto-numbering", False, str(result))
            return False

    def test_get_estimates(self):
        """Test getting all estimates"""
        success, result = self.make_request('GET', 'estimates', token=self.admin_token, expected_status=200)
        if success and isinstance(result, list) and len(result) > 0:
            self.log_test("Get estimates list", True)
            return True
        else:
            self.log_test("Get estimates list", False, str(result))
            return False

    def test_convert_estimate_to_invoice(self):
        """Test converting estimate to invoice"""
        if not self.test_estimate_id:
            self.log_test("Convert estimate to invoice", False, "No estimate ID available")
            return False
            
        success, result = self.make_request('POST', f'estimates/{self.test_estimate_id}/convert', token=self.admin_token, expected_status=200)
        if success and 'invoice_number' in result and result['invoice_number'].startswith('INV'):
            self.log_test("Convert estimate to invoice", True)
            return True
        else:
            self.log_test("Convert estimate to invoice", False, str(result))
            return False

    def test_get_settings(self):
        """Test getting company settings"""
        success, result = self.make_request('GET', 'settings', token=self.admin_token, expected_status=200)
        if success and 'company_name' in result:
            self.log_test("Get company settings", True)
            return True
        else:
            self.log_test("Get company settings", False, str(result))
            return False

    def test_update_settings(self):
        """Test updating company settings"""
        settings_data = {
            "company_name": "Breckland Heating Limited - Updated",
            "address": "123 Updated Business Park, Norwich",
            "phone": "01234 567890",
            "email": "info@brecklandheating.com"
        }
        
        success, result = self.make_request('PUT', 'settings', settings_data, token=self.admin_token, expected_status=200)
        if success and result.get('company_name') == settings_data['company_name']:
            self.log_test("Update company settings", True)
            return True
        else:
            self.log_test("Update company settings", False, str(result))
            return False

    def test_staff_access_restrictions(self):
        """Test that staff users cannot access admin-only features"""
        if not self.staff_token:
            self.log_test("Staff access restrictions", False, "No staff token available")
            return False
            
        # Test staff cannot delete customers
        success, result = self.make_request('DELETE', f'customers/{self.test_customer_id}', token=self.staff_token, expected_status=403)
        if not success and "403" in str(result):
            self.log_test("Staff access restrictions (delete customer)", True)
        else:
            self.log_test("Staff access restrictions (delete customer)", False, "Staff should not be able to delete customers")
            return False
            
        # Test staff cannot update settings
        success, result = self.make_request('PUT', 'settings', {"company_name": "Test"}, token=self.staff_token, expected_status=403)
        if not success and "403" in str(result):
            self.log_test("Staff access restrictions (update settings)", True)
            return True
        else:
            self.log_test("Staff access restrictions (update settings)", False, "Staff should not be able to update settings")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Breckland Heating API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_root_endpoint():
            print("❌ Cannot connect to API. Stopping tests.")
            return False
            
        # Authentication tests
        if not self.test_user_registration_admin():
            print("❌ Admin registration failed. Stopping tests.")
            return False
            
        if not self.test_user_registration_staff():
            print("❌ Staff registration failed. Stopping tests.")
            return False
            
        self.test_auth_me()
        
        # Customer management tests
        self.test_create_customer()
        self.test_get_customers()
        self.test_update_customer()
        
        # Service management tests
        self.test_create_service()
        self.test_get_services()
        
        # Invoice management tests
        self.test_create_invoice()
        self.test_get_invoices()
        self.test_update_invoice_status()
        
        # Estimate management tests
        self.test_create_estimate()
        self.test_get_estimates()
        self.test_convert_estimate_to_invoice()
        
        # Settings tests
        self.test_get_settings()
        self.test_update_settings()
        
        # Access control tests
        self.test_staff_access_restrictions()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

def main():
    tester = BrecklandHeatingAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())