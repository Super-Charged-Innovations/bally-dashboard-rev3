#!/usr/bin/env python3
"""
Gaming Management Backend Testing Script
Focus: Gaming Sessions and Gaming Packages API endpoints
"""

import requests
import json
from datetime import datetime

class GamingManagementTester:
    def __init__(self, base_url="https://278d5cb3-1990-4612-af40-7935ae311bb8.preview.emergentagent.com"):
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

    def test_initialize_sample_data(self):
        """Initialize sample data for testing"""
        success, response = self.run_test(
            "Initialize Sample Data",
            "POST",
            "api/init/sample-data",
            200
        )
        return success

    def test_login(self, username="superadmin", password="admin123"):
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

    def test_gaming_sessions_endpoint(self):
        """Test /api/gaming/sessions endpoint - CRITICAL TEST"""
        print("\n🎯 CRITICAL TEST: Gaming Sessions API Endpoint")
        
        success, response = self.run_test(
            "Get Gaming Sessions",
            "GET",
            "api/gaming/sessions?limit=10",
            200
        )
        
        if not success:
            print("❌ CRITICAL: Gaming Sessions endpoint failed!")
            return False
        
        # Validate response structure
        if not isinstance(response, dict):
            print("❌ CRITICAL: Gaming Sessions response is not a dictionary!")
            return False
        
        if 'sessions' not in response:
            print("❌ CRITICAL: Missing 'sessions' field in response!")
            return False
        
        if not isinstance(response['sessions'], list):
            print("❌ CRITICAL: 'sessions' field is not an array!")
            print(f"   Type: {type(response['sessions'])}")
            return False
        
        print(f"✅ Gaming Sessions endpoint working correctly")
        print(f"   Found {response.get('total', 0)} total sessions")
        print(f"   Retrieved {len(response['sessions'])} sessions")
        
        # Validate session data structure
        if response['sessions']:
            session = response['sessions'][0]
            required_fields = ['id', 'member_id', 'game_type', 'buy_in_amount', 'status']
            missing_fields = [field for field in required_fields if field not in session]
            
            if missing_fields:
                print(f"⚠️  Warning: Missing fields in session data: {missing_fields}")
            else:
                print("✅ Session data structure is complete")
            
            # Check if member_name is added for display
            if 'member_name' in session:
                print(f"✅ Member name populated: {session['member_name']}")
            else:
                print("⚠️  Warning: member_name not populated in session data")
        
        return True

    def test_gaming_sessions_filtering(self):
        """Test gaming sessions filtering by status"""
        print("\n🔍 Testing Gaming Sessions Filtering")
        
        all_passed = True
        
        for status in ["active", "completed"]:
            success, response = self.run_test(
                f"Get {status.title()} Gaming Sessions",
                "GET",
                f"api/gaming/sessions?status={status}&limit=5",
                200
            )
            
            if success:
                if 'sessions' in response and isinstance(response['sessions'], list):
                    print(f"✅ {status.title()} sessions filter working: {len(response['sessions'])} sessions")
                else:
                    print(f"❌ {status.title()} sessions filter response structure invalid")
                    all_passed = False
            else:
                print(f"❌ {status.title()} sessions filter failed")
                all_passed = False
        
        return all_passed

    def test_gaming_packages_endpoint(self):
        """Test /api/gaming/packages endpoint - CRITICAL TEST"""
        print("\n🎯 CRITICAL TEST: Gaming Packages API Endpoint")
        
        success, response = self.run_test(
            "Get Gaming Packages",
            "GET",
            "api/gaming/packages",
            200
        )
        
        if not success:
            print("❌ CRITICAL: Gaming Packages endpoint failed!")
            return False
        
        # Validate response structure
        if not isinstance(response, list):
            print("❌ CRITICAL: Gaming Packages response is not an array!")
            print(f"   Type: {type(response)}")
            return False
        
        print(f"✅ Gaming Packages endpoint working correctly")
        print(f"   Found {len(response)} gaming packages")
        
        # Validate package data structure
        if response:
            package = response[0]
            required_fields = ['id', 'name', 'description', 'price', 'credits', 'validity_hours', 'tier_access']
            missing_fields = [field for field in required_fields if field not in package]
            
            if missing_fields:
                print(f"❌ CRITICAL: Missing required fields in package data: {missing_fields}")
                return False
            else:
                print("✅ Package data structure is complete with all required fields")
            
            # Validate specific fields mentioned in the review request
            if 'credits' in package:
                print(f"✅ Credits field present: {package['credits']}")
            if 'validity_hours' in package:
                print(f"✅ Validity hours field present: {package['validity_hours']}")
            if 'tier_access' in package and isinstance(package['tier_access'], list):
                print(f"✅ Tier access field present as array: {package['tier_access']}")
            
            # Show first few packages
            for i, pkg in enumerate(response[:3]):
                print(f"   Package {i+1}: {pkg.get('name', 'Unknown')} - ${pkg.get('price', 0)} - {pkg.get('credits', 0)} credits")
        
        return True

    def test_gaming_data_consistency(self):
        """Test data consistency between gaming sessions and packages"""
        print("\n🔍 Testing Gaming Data Consistency")
        
        # Get gaming sessions
        success1, sessions_response = self.run_test(
            "Get Gaming Sessions for Consistency Check",
            "GET",
            "api/gaming/sessions?limit=20",
            200
        )
        
        # Get gaming packages
        success2, packages_response = self.run_test(
            "Get Gaming Packages for Consistency Check",
            "GET",
            "api/gaming/packages",
            200
        )
        
        if not (success1 and success2):
            print("❌ Could not retrieve data for consistency check")
            return False
        
        # Check that both endpoints return proper data structures
        sessions_valid = (
            isinstance(sessions_response, dict) and 
            'sessions' in sessions_response and 
            isinstance(sessions_response['sessions'], list)
        )
        
        packages_valid = isinstance(packages_response, list)
        
        if not sessions_valid:
            print("❌ Gaming sessions data structure inconsistent")
            return False
        
        if not packages_valid:
            print("❌ Gaming packages data structure inconsistent")
            return False
        
        print("✅ Gaming data structures are consistent")
        print(f"   Sessions: {len(sessions_response['sessions'])} items in array")
        print(f"   Packages: {len(packages_response)} items in array")
        
        return True

    def test_gaming_api_response_format(self):
        """Test API response format validation"""
        print("\n🔍 Testing Gaming API Response Format")
        
        # Test sessions response format
        success, sessions_response = self.run_test(
            "Gaming Sessions Response Format",
            "GET",
            "api/gaming/sessions?limit=5",
            200
        )
        
        if success:
            # Check pagination fields
            pagination_fields = ['total', 'page', 'pages']
            missing_pagination = [field for field in pagination_fields if field not in sessions_response]
            
            if missing_pagination:
                print(f"⚠️  Warning: Missing pagination fields in sessions: {missing_pagination}")
            else:
                print("✅ Sessions response has proper pagination format")
        
        # Test packages response format
        success2, packages_response = self.run_test(
            "Gaming Packages Response Format",
            "GET",
            "api/gaming/packages",
            200
        )
        
        if success2:
            # Packages should be a simple array
            if isinstance(packages_response, list):
                print("✅ Packages response has proper array format")
            else:
                print("❌ Packages response format is incorrect")
                return False
        
        return success and success2

    def run_gaming_management_tests(self):
        """Run all gaming management tests"""
        print("🎰 GAMING MANAGEMENT BACKEND TESTING")
        print("=" * 60)
        print("Focus: Gaming Sessions & Gaming Packages API endpoints")
        print("Testing for data structure consistency and runtime error prevention")
        print("=" * 60)
        
        # Initialize sample data
        print("\n📋 INITIALIZING TEST DATA")
        if not self.test_initialize_sample_data():
            print("❌ Failed to initialize sample data - continuing with existing data")
        
        # Login
        print("\n🔐 AUTHENTICATION")
        if not self.test_login():
            print("❌ Login failed - cannot continue tests")
            return False
        
        # Run gaming-specific tests
        print("\n🎯 GAMING MANAGEMENT TESTS")
        
        test_results = []
        
        # Test 1: Gaming Sessions API endpoint
        test_results.append(("Gaming Sessions Endpoint", self.test_gaming_sessions_endpoint()))
        
        # Test 2: Gaming Sessions Filtering
        test_results.append(("Gaming Sessions Filtering", self.test_gaming_sessions_filtering()))
        
        # Test 3: Gaming Packages API endpoint
        test_results.append(("Gaming Packages Endpoint", self.test_gaming_packages_endpoint()))
        
        # Test 4: Data Consistency
        test_results.append(("Gaming Data Consistency", self.test_gaming_data_consistency()))
        
        # Test 5: API Response Format
        test_results.append(("Gaming API Response Format", self.test_gaming_api_response_format()))
        
        # Print summary
        print("\n" + "=" * 60)
        print("🎯 GAMING MANAGEMENT TEST RESULTS")
        print("=" * 60)
        
        passed_tests = 0
        for test_name, result in test_results:
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{status}: {test_name}")
            if result:
                passed_tests += 1
        
        print(f"\nOverall Results: {passed_tests}/{len(test_results)} tests passed")
        print(f"Success Rate: {(passed_tests/len(test_results)*100):.1f}%")
        
        if passed_tests == len(test_results):
            print("\n🎉 ALL GAMING MANAGEMENT TESTS PASSED!")
            print("✅ Gaming Sessions API endpoint working correctly")
            print("✅ Gaming Packages API endpoint working correctly") 
            print("✅ Data structures are consistent and runtime-error free")
            print("✅ API response formats are correct")
        else:
            print(f"\n⚠️  {len(test_results) - passed_tests} test(s) failed")
            print("❌ Some gaming management functionality needs attention")
        
        return passed_tests == len(test_results)

if __name__ == "__main__":
    tester = GamingManagementTester()
    tester.run_gaming_management_tests()