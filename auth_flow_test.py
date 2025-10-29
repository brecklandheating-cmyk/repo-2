import requests
import sys
import json
from datetime import datetime

class AuthFlowTester:
    def __init__(self, base_url="https://unified-repos.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
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

    def make_request(self, method, endpoint, data=None, token=None):
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
            
            # Check if it's an error status code
            if response.status_code >= 400:
                try:
                    return False, response.json()
                except:
                    return False, response.text
            
            try:
                return True, response.json()
            except:
                return True, response.text
                
        except Exception as e:
            return False, f"Request failed: {str(e)}"

    def test_complete_auth_flow(self):
        """Test complete authentication flow: register -> login -> access protected resource"""
        timestamp = datetime.now().strftime("%H%M%S%f")
        
        # Step 1: Register a new user
        user_data = {
            "email": f"authtest_{timestamp}@brecklandheating.com",
            "password": "AuthTest123!",
            "name": f"Auth Test User {timestamp}",
            "role": "admin"
        }
        
        success, result = self.make_request('POST', 'auth/register', user_data)
        if not success or 'token' not in result:
            self.log_test("Complete auth flow - Registration", False, f"Registration failed: {result}")
            return False
            
        register_token = result['token']
        user_id = result['user']['id']
        
        # Step 2: Login with the same credentials
        login_data = {
            "email": user_data['email'],
            "password": user_data['password']
        }
        
        success, result = self.make_request('POST', 'auth/login', login_data)
        if not success or 'token' not in result:
            self.log_test("Complete auth flow - Login", False, f"Login failed: {result}")
            return False
            
        login_token = result['token']
        
        # Step 3: Use the login token to access protected resource
        success, result = self.make_request('GET', 'auth/me', token=login_token)
        if not success or result.get('id') != user_id:
            self.log_test("Complete auth flow - Protected access", False, f"Protected access failed: {result}")
            return False
            
        # Step 4: Verify token contains correct user info
        if result.get('email') != user_data['email'] or result.get('role') != user_data['role']:
            self.log_test("Complete auth flow - Token validation", False, f"Token contains incorrect user info: {result}")
            return False
            
        self.log_test("Complete authentication flow", True)
        return True

    def test_token_persistence(self):
        """Test that tokens work across multiple requests"""
        timestamp = datetime.now().strftime("%H%M%S%f")
        
        # Register user
        user_data = {
            "email": f"tokentest_{timestamp}@brecklandheating.com",
            "password": "TokenTest123!",
            "name": f"Token Test User {timestamp}",
            "role": "staff"
        }
        
        success, result = self.make_request('POST', 'auth/register', user_data)
        if not success or 'token' not in result:
            self.log_test("Token persistence - Registration", False, f"Registration failed: {result}")
            return False
            
        token = result['token']
        
        # Make multiple requests with the same token
        for i in range(3):
            success, result = self.make_request('GET', 'auth/me', token=token)
            if not success:
                self.log_test("Token persistence", False, f"Token failed on request {i+1}: {result}")
                return False
                
        self.log_test("Token persistence across multiple requests", True)
        return True

    def run_auth_tests(self):
        """Run all authentication tests"""
        print("🔐 Starting Authentication Flow Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        self.test_complete_auth_flow()
        self.test_token_persistence()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Auth Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All authentication tests passed!")
            return True
        else:
            print("⚠️  Some authentication tests failed.")
            return False

def main():
    tester = AuthFlowTester()
    success = tester.run_auth_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())