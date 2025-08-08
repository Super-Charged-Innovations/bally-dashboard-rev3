import requests
import sys
import json
from datetime import datetime

class BallyCasinoAPITester:
    def __init__(self, base_url="https://77b2f52c-0653-4a79-bddb-98a5cd48a43c.preview.emergentagent.com"):
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

    # Phase 2 Tests - Marketing Intelligence & Travel Management
    
    def test_marketing_dashboard(self):
        """Test marketing intelligence dashboard"""
        success, response = self.run_test(
            "Marketing Dashboard",
            "GET",
            "api/marketing/dashboard",
            200
        )
        if success:
            required_fields = ['birthday_members', 'inactive_members', 'walk_in_today', 
                             'walk_in_conversion_rate', 'active_campaigns', 'customer_segments']
            for field in required_fields:
                if field not in response:
                    print(f"   Warning: Missing field '{field}' in marketing dashboard")
                else:
                    if field == 'birthday_members':
                        print(f"   Birthday members this month: {len(response[field])}")
                    elif field == 'inactive_members':
                        print(f"   Inactive members: {len(response[field])}")
                    elif field == 'walk_in_today':
                        print(f"   Walk-in guests today: {response[field]}")
                    elif field == 'active_campaigns':
                        print(f"   Active campaigns: {response[field]}")
        return success

    def test_birthday_calendar(self):
        """Test birthday calendar endpoint"""
        success, response = self.run_test(
            "Birthday Calendar - All",
            "GET",
            "api/marketing/birthday-calendar?limit=10",
            200
        )
        if success and 'birthdays' in response:
            print(f"   Found {response['total']} total birthday entries")
            print(f"   Retrieved {len(response['birthdays'])} entries")
        
        # Test filtering by month
        current_month = datetime.now().month
        success2, response2 = self.run_test(
            f"Birthday Calendar - Month {current_month}",
            "GET",
            f"api/marketing/birthday-calendar?month={current_month}&limit=5",
            200
        )
        
        return success and success2

    def test_inactive_customers(self):
        """Test inactive customers analysis"""
        success, response = self.run_test(
            "Inactive Customers - 30 days",
            "GET",
            "api/marketing/inactive-customers?days=30&limit=10",
            200
        )
        if success and 'inactive_members' in response:
            print(f"   Found {response['total']} inactive members (30+ days)")
            print(f"   Retrieved {len(response['inactive_members'])} members")
            
            # Check if risk scores are included
            for member in response['inactive_members'][:3]:
                if 'risk_score' in member:
                    print(f"   - {member.get('first_name', 'Unknown')} {member.get('last_name', '')}: Risk Score {member['risk_score']}")
        
        # Test different day ranges
        success2, response2 = self.run_test(
            "Inactive Customers - 60 days",
            "GET",
            "api/marketing/inactive-customers?days=60&limit=5",
            200
        )
        
        return success and success2

    def test_walk_in_guests(self):
        """Test walk-in guests tracking"""
        success, response = self.run_test(
            "Walk-in Guests - All",
            "GET",
            "api/marketing/walk-in-guests?limit=10",
            200
        )
        if success and 'guests' in response:
            print(f"   Found {response['total']} total walk-in guests")
            print(f"   Retrieved {len(response['guests'])} guests")
            
            # Check conversion tracking
            converted_count = sum(1 for guest in response['guests'] if guest.get('converted_to_member'))
            print(f"   Converted to members: {converted_count}/{len(response['guests'])}")
        
        # Test filtering by date
        today = datetime.now().strftime('%Y-%m-%d')
        success2, response2 = self.run_test(
            f"Walk-in Guests - Today ({today})",
            "GET",
            f"api/marketing/walk-in-guests?date={today}T00:00:00Z&limit=5",
            200
        )
        
        return success and success2

    def test_marketing_campaigns(self):
        """Test marketing campaigns management"""
        # Get existing campaigns
        success, response = self.run_test(
            "Get Marketing Campaigns",
            "GET",
            "api/marketing/campaigns?limit=10",
            200
        )
        if success and 'campaigns' in response:
            print(f"   Found {response['total']} total campaigns")
            print(f"   Retrieved {len(response['campaigns'])} campaigns")
            
            # Show campaign types
            campaign_types = {}
            for campaign in response['campaigns']:
                campaign_type = campaign.get('campaign_type', 'unknown')
                campaign_types[campaign_type] = campaign_types.get(campaign_type, 0) + 1
            print(f"   Campaign types: {campaign_types}")
        
        # Test filtering by status
        success2, response2 = self.run_test(
            "Get Active Campaigns",
            "GET",
            "api/marketing/campaigns?status=active&limit=5",
            200
        )
        
        # Test filtering by campaign type
        success3, response3 = self.run_test(
            "Get Birthday Campaigns",
            "GET",
            "api/marketing/campaigns?campaign_type=birthday&limit=5",
            200
        )
        
        return success and success2 and success3

    def test_create_marketing_campaign(self):
        """Test creating a new marketing campaign"""
        campaign_data = {
            "name": "Test Campaign - API Test",
            "description": "Test campaign created during API testing",
            "campaign_type": "general",
            "target_audience": ["Ruby", "Sapphire"],
            "start_date": "2024-01-01T00:00:00Z",
            "end_date": "2024-01-31T23:59:59Z",
            "budget": 1000.0,
            "estimated_reach": 50,
            "status": "draft"
        }
        
        success, response = self.run_test(
            "Create Marketing Campaign",
            "POST",
            "api/marketing/campaigns",
            200,
            data=campaign_data
        )
        
        if success and 'id' in response:
            print(f"   Created campaign with ID: {response['id']}")
        
        return success

    def test_vip_travel_dashboard(self):
        """Test VIP travel management dashboard"""
        success, response = self.run_test(
            "VIP Travel Dashboard",
            "GET",
            "api/travel/vip-dashboard",
            200
        )
        if success:
            required_fields = ['upcoming_vip_experiences', 'active_group_bookings', 
                             'avg_vip_satisfaction', 'vip_revenue_this_month', 'upcoming_arrivals']
            for field in required_fields:
                if field not in response:
                    print(f"   Warning: Missing field '{field}' in VIP dashboard")
                else:
                    if field == 'upcoming_vip_experiences':
                        print(f"   Upcoming VIP experiences: {response[field]}")
                    elif field == 'active_group_bookings':
                        print(f"   Active group bookings: {response[field]}")
                    elif field == 'avg_vip_satisfaction':
                        print(f"   Average VIP satisfaction: {response[field]}/10")
                    elif field == 'vip_revenue_this_month':
                        print(f"   VIP revenue this month: ${response[field]}")
        return success

    def test_vip_experiences(self):
        """Test VIP experiences management"""
        success, response = self.run_test(
            "Get VIP Experiences",
            "GET",
            "api/travel/vip-experiences?limit=10",
            200
        )
        if success and 'experiences' in response:
            print(f"   Found {response['total']} total VIP experiences")
            print(f"   Retrieved {len(response['experiences'])} experiences")
            
            # Show experience types
            experience_types = {}
            for exp in response['experiences']:
                exp_type = exp.get('experience_type', 'unknown')
                experience_types[exp_type] = experience_types.get(exp_type, 0) + 1
            print(f"   Experience types: {experience_types}")
        
        # Test filtering by status
        for status in ["planned", "completed", "in_progress"]:
            success2, response2 = self.run_test(
                f"Get {status.title()} VIP Experiences",
                "GET",
                f"api/travel/vip-experiences?status={status}&limit=5",
                200
            )
            if not success2:
                return False
        
        return success

    def test_create_vip_experience(self):
        """Test creating a new VIP experience"""
        # First get a VIP member ID
        success, response = self.run_test(
            "Get VIP Members for Experience Test",
            "GET",
            "api/members?tier=VIP&limit=1",
            200
        )
        
        if success and response.get('members'):
            member_id = response['members'][0]['id']
            
            experience_data = {
                "member_id": member_id,
                "experience_type": "dining",
                "scheduled_date": "2024-02-01T19:00:00Z",
                "services_included": ["Personal Host", "Premium Dining"],
                "special_requests": ["Window table", "Champagne service"],
                "cost": 500.0,
                "status": "planned"
            }
            
            success2, response2 = self.run_test(
                "Create VIP Experience",
                "POST",
                "api/travel/vip-experiences",
                200,
                data=experience_data
            )
            
            if success2 and 'id' in response2:
                print(f"   Created VIP experience with ID: {response2['id']}")
            
            return success2
        else:
            print("   Skipping VIP experience creation - no VIP members found")
            return True

    def test_group_bookings(self):
        """Test group bookings management"""
        success, response = self.run_test(
            "Get Group Bookings",
            "GET",
            "api/travel/group-bookings?limit=10",
            200
        )
        if success and 'bookings' in response:
            print(f"   Found {response['total']} total group bookings")
            print(f"   Retrieved {len(response['bookings'])} bookings")
            
            # Show booking types and statuses
            booking_types = {}
            booking_statuses = {}
            for booking in response['bookings']:
                booking_type = booking.get('group_type', 'unknown')
                booking_status = booking.get('status', 'unknown')
                booking_types[booking_type] = booking_types.get(booking_type, 0) + 1
                booking_statuses[booking_status] = booking_statuses.get(booking_status, 0) + 1
            print(f"   Booking types: {booking_types}")
            print(f"   Booking statuses: {booking_statuses}")
        
        # Test filtering by status
        for status in ["inquiry", "confirmed", "completed"]:
            success2, response2 = self.run_test(
                f"Get {status.title()} Group Bookings",
                "GET",
                f"api/travel/group-bookings?status={status}&limit=5",
                200
            )
            if not success2:
                return False
        
        return success

    def test_create_group_booking(self):
        """Test creating a new group booking"""
        booking_data = {
            "group_name": "Test Corporate Event - API Test",
            "contact_person": "John Test Manager",
            "contact_email": "john.test@example.com",
            "contact_phone": "0771234567",
            "group_size": 25,
            "group_type": "corporate",
            "booking_date": "2024-01-15T10:00:00Z",
            "arrival_date": "2024-02-15T14:00:00Z",
            "departure_date": "2024-02-17T12:00:00Z",
            "special_requirements": ["AV Equipment", "Private dining area"],
            "budget_range": "high",
            "services_requested": ["Dining", "Gaming", "Entertainment"],
            "total_estimated_value": 15000.0,
            "status": "inquiry"
        }
        
        success, response = self.run_test(
            "Create Group Booking",
            "POST",
            "api/travel/group-bookings",
            200,
            data=booking_data
        )
        
        if success and 'id' in response:
            print(f"   Created group booking with ID: {response['id']}")
        
        return success

def main():
    print("🎰 Bally's Casino Admin Dashboard API Testing - Phase 2")
    print("=" * 60)
    
    # Setup - Use the public endpoint from frontend .env
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
    
    # Test 7: Phase 2 - Marketing Intelligence Tests
    print("\n📋 PHASE 2 - MARKETING INTELLIGENCE TESTS")
    tester.test_marketing_dashboard()
    tester.test_birthday_calendar()
    tester.test_inactive_customers()
    tester.test_walk_in_guests()
    tester.test_marketing_campaigns()
    tester.test_create_marketing_campaign()
    
    # Test 8: Phase 2 - Travel & VIP Management Tests
    print("\n📋 PHASE 2 - TRAVEL & VIP MANAGEMENT TESTS")
    tester.test_vip_travel_dashboard()
    tester.test_vip_experiences()
    tester.test_create_vip_experience()
    tester.test_group_bookings()
    tester.test_create_group_booking()
    
    # Test 9: Security Tests
    print("\n📋 SECURITY TESTS")
    tester.test_unauthorized_access()
    
    # Test 10: Manager Role Test
    print("\n📋 ROLE-BASED ACCESS TESTS")
    if not tester.test_login("manager", "manager123"):
        print("❌ Manager login failed")
    else:
        # Test manager can access basic endpoints
        tester.test_dashboard_metrics()
        tester.test_get_members()
        # Test manager can access Phase 2 features
        tester.test_marketing_dashboard()
        tester.test_vip_travel_dashboard()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS - PHASE 2 TESTING")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All Phase 2 tests passed! Backend is working correctly.")
        return 0
    else:
        failed = tester.tests_run - tester.tests_passed
        print(f"⚠️  {failed} test(s) failed. Please check the issues above.")
        
        # If more than 50% failed, recommend fixing backend first
        if failed > (tester.tests_run * 0.5):
            print("🚨 More than 50% of tests failed. Recommend fixing backend issues first.")
        
        return 1

if __name__ == "__main__":
    sys.exit(main())