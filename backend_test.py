import requests
import sys
import json
from datetime import datetime

class BallyCasinoAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_info = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_initialize_sample_data(self):
        """Initialize sample data for testing"""
        success, response = self.run_test(
            "Initialize Sample Data",
            "POST",
            "api/init/sample-data",
            200
        )
        return success

    def test_login(self, username, password):
        """Test login and get token"""
        success, response = self.run_test(
            f"Login ({username})",
            "POST",
            "api/auth/login",
            200,
            data={"username": username, "password": password}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_info = response.get('user_info', {})
            print(f"   Logged in as: {self.user_info.get('full_name', username)}")
            print(f"   Role: {self.user_info.get('role', 'Unknown')}")
            return True
        return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "api/auth/login",
            401,
            data={"username": "invalid", "password": "invalid"}
        )
        return success

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "api/auth/me",
            200
        )
        return success

    def test_dashboard_metrics(self):
        """Test dashboard metrics endpoint"""
        success, response = self.run_test(
            "Dashboard Metrics",
            "GET",
            "api/dashboard/metrics",
            200
        )
        if success:
            required_fields = ['total_members', 'members_by_tier', 'active_sessions', 
                             'daily_revenue', 'weekly_revenue', 'monthly_revenue']
            for field in required_fields:
                if field not in response:
                    print(f"   Warning: Missing field '{field}' in dashboard metrics")
        return success

    def test_get_members(self):
        """Test getting members list"""
        success, response = self.run_test(
            "Get Members List",
            "GET",
            "api/members?limit=10",
            200
        )
        if success:
            if 'members' in response and 'total' in response:
                print(f"   Found {response['total']} total members")
                print(f"   Retrieved {len(response['members'])} members")
            else:
                print("   Warning: Unexpected response format")
        return success

    def test_search_members(self):
        """Test member search functionality"""
        success, response = self.run_test(
            "Search Members",
            "GET",
            "api/members?search=Member1&limit=5",
            200
        )
        return success

    def test_filter_members_by_tier(self):
        """Test filtering members by tier"""
        for tier in ["Ruby", "Sapphire", "Diamond", "VIP"]:
            success, response = self.run_test(
                f"Filter Members by {tier} Tier",
                "GET",
                f"api/members?tier={tier}&limit=5",
                200
            )
            if not success:
                return False
        return True

    def test_get_member_details(self):
        """Test getting specific member details"""
        # First get a member ID
        success, response = self.run_test(
            "Get Members for Detail Test",
            "GET",
            "api/members?limit=1",
            200
        )
        
        if success and response.get('members'):
            member_id = response['members'][0]['id']
            success, response = self.run_test(
                "Get Member Details",
                "GET",
                f"api/members/{member_id}",
                200
            )
            return success
        else:
            print("   Skipping member details test - no members found")
            return True

    def test_gaming_sessions(self):
        """Test gaming sessions endpoint"""
        success, response = self.run_test(
            "Get Gaming Sessions",
            "GET",
            "api/gaming/sessions?limit=10",
            200
        )
        if success:
            if 'sessions' in response and 'total' in response:
                print(f"   Found {response['total']} total sessions")
                print(f"   Retrieved {len(response['sessions'])} sessions")
        return success

    def test_gaming_sessions_by_status(self):
        """Test filtering gaming sessions by status"""
        for status in ["active", "completed"]:
            success, response = self.run_test(
                f"Get {status.title()} Gaming Sessions",
                "GET",
                f"api/gaming/sessions?status={status}&limit=5",
                200
            )
            if not success:
                return False
        return True

    def test_gaming_packages(self):
        """Test gaming packages endpoint"""
        success, response = self.run_test(
            "Get Gaming Packages",
            "GET",
            "api/gaming/packages",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} gaming packages")
            for package in response[:3]:  # Show first 3 packages
                print(f"   - {package.get('name', 'Unknown')}: ${package.get('price', 0)}")
        return success

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        old_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access Test",
            "GET",
            "api/dashboard/metrics",
            401
        )
        
        self.token = old_token
        return success

def main():
    print("🎰 Bally's Casino Admin Dashboard API Testing")
    print("=" * 50)
    
    # Setup
    tester = BallyCasinoAPITester("http://localhost:8001")
    
    # Test 1: Health Check
    print("\n📋 BASIC CONNECTIVITY TESTS")
    if not tester.test_health_check():
        print("❌ Health check failed - backend may not be running")
        return 1
    
    # Test 2: Initialize Sample Data
    print("\n📋 DATA INITIALIZATION")
    if not tester.test_initialize_sample_data():
        print("❌ Sample data initialization failed")
        return 1
    
    # Test 3: Authentication Tests
    print("\n📋 AUTHENTICATION TESTS")
    
    # Test invalid login first
    tester.test_invalid_login()
    
    # Test superadmin login
    if not tester.test_login("superadmin", "admin123"):
        print("❌ SuperAdmin login failed")
        return 1
    
    # Test current user endpoint
    tester.test_get_current_user()
    
    # Test 4: Dashboard Tests
    print("\n📋 DASHBOARD TESTS")
    tester.test_dashboard_metrics()
    
    # Test 5: Member Management Tests
    print("\n📋 MEMBER MANAGEMENT TESTS")
    tester.test_get_members()
    tester.test_search_members()
    tester.test_filter_members_by_tier()
    tester.test_get_member_details()
    
    # Test 6: Gaming Management Tests
    print("\n📋 GAMING MANAGEMENT TESTS")
    tester.test_gaming_sessions()
    tester.test_gaming_sessions_by_status()
    tester.test_gaming_packages()
    
    # Test 7: Security Tests
    print("\n📋 SECURITY TESTS")
    tester.test_unauthorized_access()
    
    # Test 8: Manager Role Test
    print("\n📋 ROLE-BASED ACCESS TESTS")
    if not tester.test_login("manager", "manager123"):
        print("❌ Manager login failed")
    else:
        # Test manager can access basic endpoints
        tester.test_dashboard_metrics()
        tester.test_get_members()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! Backend is working correctly.")
        return 0
    else:
        failed = tester.tests_run - tester.tests_passed
        print(f"⚠️  {failed} test(s) failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())