import requests
import sys
import json
from datetime import datetime

class BallyCasinoAPITester:
    def __init__(self, base_url="https://casino-enterprise.preview.emergentagent.com"):
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

    # Phase 3 Tests - Staff Management & Advanced Analytics
    
    def test_staff_dashboard(self):
        """Test staff management dashboard"""
        success, response = self.run_test(
            "Staff Management Dashboard",
            "GET",
            "api/staff/dashboard",
            200
        )
        if success:
            required_fields = ['total_staff', 'staff_by_department', 'training_completion_rate', 
                             'average_performance_score', 'upcoming_reviews', 'recent_training_enrollments']
            for field in required_fields:
                if field not in response:
                    print(f"   Warning: Missing field '{field}' in staff dashboard")
                else:
                    if field == 'total_staff':
                        print(f"   Total active staff: {response[field]}")
                    elif field == 'staff_by_department':
                        print(f"   Staff by department: {response[field]}")
                    elif field == 'training_completion_rate':
                        print(f"   Training completion rate: {response[field]}%")
                    elif field == 'average_performance_score':
                        print(f"   Average performance score: {response[field]}/100")
        return success

    def test_staff_members(self):
        """Test staff members management"""
        success, response = self.run_test(
            "Get Staff Members",
            "GET",
            "api/staff/members?limit=10",
            200
        )
        if success and 'staff_members' in response:
            print(f"   Found {response['total']} total staff members")
            print(f"   Retrieved {len(response['staff_members'])} staff members")
            
            # Show departments
            departments = {}
            for staff in response['staff_members']:
                dept = staff.get('department', 'unknown')
                departments[dept] = departments.get(dept, 0) + 1
            print(f"   Departments: {departments}")
        
        # Test filtering by department
        for dept in ["Gaming", "F&B", "Security", "Management"]:
            success2, response2 = self.run_test(
                f"Get {dept} Staff",
                "GET",
                f"api/staff/members?department={dept}&limit=5",
                200
            )
            if not success2:
                return False
        
        # Test search functionality
        success3, response3 = self.run_test(
            "Search Staff Members",
            "GET",
            "api/staff/members?search=Staff&limit=5",
            200
        )
        
        return success and success3

    def test_training_courses(self):
        """Test training courses management"""
        success, response = self.run_test(
            "Get Training Courses",
            "GET",
            "api/staff/training/courses",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} training courses")
            
            # Show course categories
            categories = {}
            for course in response:
                category = course.get('category', 'unknown')
                categories[category] = categories.get(category, 0) + 1
            print(f"   Course categories: {categories}")
        
        # Test filtering by category
        success2, response2 = self.run_test(
            "Get Safety Training Courses",
            "GET",
            "api/staff/training/courses?category=safety",
            200
        )
        
        return success and success2

    def test_create_training_course(self):
        """Test creating a new training course"""
        course_data = {
            "course_name": "API Test Training Course",
            "description": "Test course created during API testing",
            "category": "technical",
            "difficulty_level": "beginner",
            "duration_hours": 4,
            "required_for_positions": ["Gaming Dealer", "Floor Supervisor"],
            "prerequisites": [],
            "content_modules": ["Module 1: Basics", "Module 2: Advanced"],
            "assessment_questions": [
                {"question": "Test question?", "options": ["A", "B", "C", "D"], "correct": "A"}
            ],
            "passing_score": 80,
            "is_mandatory": False,
            "is_active": True
        }
        
        success, response = self.run_test(
            "Create Training Course",
            "POST",
            "api/staff/training/courses",
            200,
            data=course_data
        )
        
        if success and 'id' in response:
            print(f"   Created training course with ID: {response['id']}")
        
        return success

    def test_training_records(self):
        """Test training records management"""
        success, response = self.run_test(
            "Get Training Records",
            "GET",
            "api/staff/training/records?limit=10",
            200
        )
        if success and 'training_records' in response:
            print(f"   Found {response['total']} total training records")
            print(f"   Retrieved {len(response['training_records'])} records")
            
            # Show training statuses
            statuses = {}
            for record in response['training_records']:
                status = record.get('status', 'unknown')
                statuses[status] = statuses.get(status, 0) + 1
            print(f"   Training statuses: {statuses}")
        
        # Test filtering by status
        for status in ["enrolled", "completed", "in_progress"]:
            success2, response2 = self.run_test(
                f"Get {status.title()} Training Records",
                "GET",
                f"api/staff/training/records?status={status}&limit=5",
                200
            )
            if not success2:
                return False
        
        return success

    def test_create_performance_review(self):
        """Test creating a performance review"""
        # First get a staff member ID
        success, response = self.run_test(
            "Get Staff for Review Test",
            "GET",
            "api/staff/members?limit=1",
            200
        )
        
        if success and response.get('staff_members'):
            staff_id = response['staff_members'][0]['id']
            
            review_data = {
                "staff_id": staff_id,
                "review_period_start": "2024-01-01T00:00:00Z",
                "review_period_end": "2024-06-30T23:59:59Z",
                "overall_rating": 4,
                "performance_areas": {
                    "customer_service": 4,
                    "technical_skills": 5,
                    "teamwork": 4,
                    "punctuality": 5
                },
                "achievements": ["Completed advanced training", "Excellent customer feedback"],
                "areas_for_improvement": ["Time management", "Leadership skills"],
                "goals_set": ["Complete leadership training", "Mentor new staff"],
                "training_recommendations": ["Leadership Development Course"],
                "employee_comments": "Looking forward to growth opportunities",
                "reviewer_comments": "Strong performer with leadership potential",
                "review_status": "completed"
            }
            
            success2, response2 = self.run_test(
                "Create Performance Review",
                "POST",
                "api/staff/performance/reviews",
                200,
                data=review_data
            )
            
            if success2 and 'id' in response2:
                print(f"   Created performance review with ID: {response2['id']}")
            
            return success2
        else:
            print("   Skipping performance review creation - no staff members found")
            return True

    def test_advanced_analytics(self):
        """Test advanced analytics endpoints"""
        success, response = self.run_test(
            "Get Advanced Analytics",
            "GET",
            "api/analytics/advanced?limit=10",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} analytics reports")
            
            # Show analysis types
            analysis_types = {}
            for analysis in response:
                analysis_type = analysis.get('analysis_type', 'unknown')
                analysis_types[analysis_type] = analysis_types.get(analysis_type, 0) + 1
            print(f"   Analysis types: {analysis_types}")
        
        # Test filtering by analysis type
        success2, response2 = self.run_test(
            "Get Customer LTV Analytics",
            "GET",
            "api/analytics/advanced?analysis_type=customer_ltv",
            200
        )
        
        return success and success2

    def test_generate_analytics_report(self):
        """Test generating advanced analytics reports"""
        # Test different analysis types
        analysis_types = ["customer_ltv", "churn_prediction", "operational_efficiency"]
        
        for analysis_type in analysis_types:
            request_data = {
                "analysis_type": analysis_type,
                "time_period": "monthly"
            }
            
            success, response = self.run_test(
                f"Generate {analysis_type.replace('_', ' ').title()} Report",
                "POST",
                "api/analytics/generate",
                200,
                data=request_data
            )
            
            if success and 'analysis' in response:
                analysis = response['analysis']
                print(f"   Generated {analysis_type} report with confidence: {analysis.get('confidence_score', 0)}%")
                print(f"   Insights: {len(analysis.get('insights', []))}")
                print(f"   Recommendations: {len(analysis.get('recommendations', []))}")
            
            if not success:
                return False
        
        return True

    def test_cost_optimization(self):
        """Test cost optimization management"""
        success, response = self.run_test(
            "Get Cost Optimization Opportunities",
            "GET",
            "api/optimization/cost-savings",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} cost optimization opportunities")
            
            # Show optimization areas
            areas = {}
            for opp in response:
                area = opp.get('optimization_area', 'unknown')
                areas[area] = areas.get(area, 0) + 1
            print(f"   Optimization areas: {areas}")
        
        # Test filtering by area
        success2, response2 = self.run_test(
            "Get Staffing Optimization",
            "GET",
            "api/optimization/cost-savings?area=staffing",
            200
        )
        
        # Test filtering by status
        success3, response3 = self.run_test(
            "Get Proposed Optimizations",
            "GET",
            "api/optimization/cost-savings?status=proposed",
            200
        )
        
        return success and success2 and success3

    def test_create_cost_optimization(self):
        """Test creating a cost optimization opportunity"""
        optimization_data = {
            "optimization_area": "energy",
            "current_cost": 5000.0,
            "projected_savings": 1200.0,
            "implementation_cost": 800.0,
            "roi_percentage": 50.0,
            "timeline_weeks": 8,
            "implementation_status": "proposed",
            "priority_level": "medium",
            "responsible_department": "Maintenance",
            "success_metrics": ["Energy consumption reduction", "Cost savings achieved"],
            "risks": ["Initial disruption", "Staff training required"],
            "mitigation_strategies": ["Phased implementation", "Comprehensive training program"]
        }
        
        success, response = self.run_test(
            "Create Cost Optimization",
            "POST",
            "api/optimization/opportunities",
            200,
            data=optimization_data
        )
        
        if success and 'id' in response:
            print(f"   Created cost optimization with ID: {response['id']}")
        
        return success

    def test_predictive_models(self):
        """Test predictive models management"""
        success, response = self.run_test(
            "Get Predictive Models",
            "GET",
            "api/predictive/models",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} predictive models")
            
            # Show model types
            model_types = {}
            for model in response:
                model_type = model.get('model_type', 'unknown')
                model_types[model_type] = model_types.get(model_type, 0) + 1
            print(f"   Model types: {model_types}")
        
        # Test filtering by model type
        success2, response2 = self.run_test(
            "Get Churn Prediction Models",
            "GET",
            "api/predictive/models?model_type=churn_prediction",
            200
        )
        
        # Test filtering by production status
        success3, response3 = self.run_test(
            "Get Production Models",
            "GET",
            "api/predictive/models?is_production=true",
            200
        )
        
        return success and success2 and success3

    def test_create_predictive_model(self):
        """Test creating a predictive model"""
        model_data = {
            "model_name": "Test Churn Prediction Model",
            "model_type": "churn_prediction",
            "description": "Test model created during API testing",
            "input_features": ["visit_frequency", "avg_spend", "last_visit_days", "tier"],
            "target_variable": "will_churn",
            "algorithm_used": "Random Forest",
            "training_data_size": 1000,
            "accuracy_score": 0.85,
            "precision_score": 0.82,
            "recall_score": 0.88,
            "model_version": "1.0",
            "is_production": False,
            "predictions_made": 0,
            "success_rate": 0.0
        }
        
        success, response = self.run_test(
            "Create Predictive Model",
            "POST",
            "api/predictive/models",
            200,
            data=model_data
        )
        
        if success and 'id' in response:
            print(f"   Created predictive model with ID: {response['id']}")
        
        return success

    # Phase 4 Tests - Enterprise Features
    
    def test_notifications_system(self):
        """Test notification system endpoints"""
        # Get all notifications
        success, response = self.run_test(
            "Get All Notifications",
            "GET",
            "api/notifications?limit=10",
            200
        )
        if success and 'notifications' in response:
            print(f"   Found {response['total']} total notifications")
            print(f"   Retrieved {len(response['notifications'])} notifications")
            
            # Show notification categories
            categories = {}
            for notification in response['notifications']:
                category = notification.get('category', 'unknown')
                categories[category] = categories.get(category, 0) + 1
            print(f"   Notification categories: {categories}")
        
        # Test filtering by category
        for category in ["security", "compliance", "marketing", "system"]:
            success2, response2 = self.run_test(
                f"Get {category.title()} Notifications",
                "GET",
                f"api/notifications?category={category}&limit=5",
                200
            )
            if not success2:
                return False
        
        # Test filtering by priority
        for priority in ["low", "normal", "high", "critical"]:
            success3, response3 = self.run_test(
                f"Get {priority.title()} Priority Notifications",
                "GET",
                f"api/notifications?priority={priority}&limit=5",
                200
            )
            if not success3:
                return False
        
        return success

    def test_create_notification(self):
        """Test creating a new notification"""
        notification_data = {
            "recipient_type": "admin",
            "recipient_id": self.user_info.get('id') if self.user_info else None,
            "recipient_email": "admin@ballys.lk",
            "title": "Test Notification - API Testing",
            "content": "This is a test notification created during API testing",
            "category": "system",
            "priority": "normal",
            "channels": ["in_app", "email"],
            "status": "pending"
        }
        
        success, response = self.run_test(
            "Create Notification",
            "POST",
            "api/notifications",
            200,
            data=notification_data
        )
        
        if success and 'id' in response:
            print(f"   Created notification with ID: {response['id']}")
            
            # Test marking notification as read
            success2, response2 = self.run_test(
                "Mark Notification as Read",
                "PATCH",
                f"api/notifications/{response['id']}/read",
                200
            )
            return success and success2
        
        return success

    def test_notification_templates(self):
        """Test notification templates management"""
        # Get all templates
        success, response = self.run_test(
            "Get Notification Templates",
            "GET",
            "api/notifications/templates",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} notification templates")
            
            # Show template categories
            categories = {}
            for template in response:
                category = template.get('category', 'unknown')
                categories[category] = categories.get(category, 0) + 1
            print(f"   Template categories: {categories}")
        
        # Test filtering by category
        success2, response2 = self.run_test(
            "Get Security Templates",
            "GET",
            "api/notifications/templates?category=security",
            200
        )
        
        return success and success2

    def test_create_notification_template(self):
        """Test creating a notification template"""
        template_data = {
            "name": "Test Alert Template",
            "category": "system",
            "title": "System Alert: {alert_type}",
            "content": "A system alert has been triggered: {description}. Please review immediately.",
            "variables": ["alert_type", "description"],
            "channels": ["in_app", "email"],
            "priority": "high",
            "is_active": True
        }
        
        success, response = self.run_test(
            "Create Notification Template",
            "POST",
            "api/notifications/templates",
            200,
            data=template_data
        )
        
        if success and 'id' in response:
            print(f"   Created notification template with ID: {response['id']}")
        
        return success

    def test_compliance_reports(self):
        """Test compliance reporting system"""
        # Get all compliance reports
        success, response = self.run_test(
            "Get Compliance Reports",
            "GET",
            "api/compliance/reports?limit=10",
            200
        )
        if success and 'reports' in response:
            print(f"   Found {response['total']} total compliance reports")
            print(f"   Retrieved {len(response['reports'])} reports")
            
            # Show report types
            report_types = {}
            for report in response['reports']:
                report_type = report.get('report_type', 'unknown')
                report_types[report_type] = report_types.get(report_type, 0) + 1
            print(f"   Report types: {report_types}")
        
        # Test filtering by report type
        for report_type in ["audit_trail", "kyc_compliance", "data_retention"]:
            success2, response2 = self.run_test(
                f"Get {report_type.replace('_', ' ').title()} Reports",
                "GET",
                f"api/compliance/reports?report_type={report_type}&limit=5",
                200
            )
            if not success2:
                return False
        
        return success

    def test_generate_compliance_report(self):
        """Test generating compliance reports"""
        # Test different report types
        report_types = ["audit_trail", "kyc_compliance", "data_retention"]
        
        for report_type in report_types:
            request_data = {
                "report_type": report_type,
                "start_date": "2024-01-01T00:00:00Z",
                "end_date": "2024-12-31T23:59:59Z"
            }
            
            success, response = self.run_test(
                f"Generate {report_type.replace('_', ' ').title()} Report",
                "POST",
                "api/compliance/reports/generate",
                200,
                data=request_data
            )
            
            if success and 'report' in response:
                report = response['report']
                print(f"   Generated {report_type} report with compliance score: {report.get('compliance_score', 0)}%")
                print(f"   Violations found: {len(report.get('violations', []))}")
                print(f"   Recommendations: {len(report.get('recommendations', []))}")
            
            if not success:
                return False
        
        return True

    def test_enhanced_audit_logs(self):
        """Test enhanced audit logs with risk scoring"""
        success, response = self.run_test(
            "Get Enhanced Audit Logs",
            "GET",
            "api/audit/enhanced?limit=20",
            200
        )
        if success and 'audit_logs' in response:
            print(f"   Found {response['total']} total audit logs")
            print(f"   Retrieved {len(response['audit_logs'])} logs")
            
            # Check risk scoring
            risk_levels = {}
            for log in response['audit_logs']:
                risk_level = log.get('risk_level', 'unknown')
                risk_levels[risk_level] = risk_levels.get(risk_level, 0) + 1
            print(f"   Risk levels: {risk_levels}")
            
            # Check summary data
            if 'summary' in response:
                summary = response['summary']
                print(f"   High risk activities: {summary.get('high_risk_activities', 0)}")
                print(f"   Actions breakdown: {summary.get('actions_breakdown', {})}")
        
        # Test filtering by action
        success2, response2 = self.run_test(
            "Get Create Action Audit Logs",
            "GET",
            "api/audit/enhanced?action=create&limit=10",
            200
        )
        
        # Test filtering by resource
        success3, response3 = self.run_test(
            "Get Member Resource Audit Logs",
            "GET",
            "api/audit/enhanced?resource=member&limit=10",
            200
        )
        
        return success and success2 and success3

    def test_system_integrations(self):
        """Test system integrations management"""
        # Get all integrations
        success, response = self.run_test(
            "Get System Integrations",
            "GET",
            "api/integrations",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} system integrations")
            
            # Show integration types and statuses
            integration_types = {}
            statuses = {}
            for integration in response:
                int_type = integration.get('integration_type', 'unknown')
                status = integration.get('status', 'unknown')
                integration_types[int_type] = integration_types.get(int_type, 0) + 1
                statuses[status] = statuses.get(status, 0) + 1
            print(f"   Integration types: {integration_types}")
            print(f"   Integration statuses: {statuses}")
        
        # Test filtering by integration type
        for int_type in ["payment_gateway", "email_service", "analytics_service"]:
            success2, response2 = self.run_test(
                f"Get {int_type.replace('_', ' ').title()} Integrations",
                "GET",
                f"api/integrations?integration_type={int_type}",
                200
            )
            if not success2:
                return False
        
        # Test filtering by status
        success3, response3 = self.run_test(
            "Get Active Integrations",
            "GET",
            "api/integrations?status=active",
            200
        )
        
        return success and success3

    def test_create_system_integration(self):
        """Test creating a system integration"""
        integration_data = {
            "name": "Test API Integration",
            "integration_type": "analytics_service",
            "provider": "test_provider",
            "endpoint_url": "https://api.test-provider.com",
            "configuration": {
                "api_version": "v1",
                "timeout": 30,
                "retry_count": 3
            },
            "status": "testing",
            "sync_frequency": "hourly"
        }
        
        success, response = self.run_test(
            "Create System Integration",
            "POST",
            "api/integrations",
            200,
            data=integration_data
        )
        
        if success and 'id' in response:
            print(f"   Created system integration with ID: {response['id']}")
            
            # Test sync integration
            success2, response2 = self.run_test(
                "Sync Integration",
                "PATCH",
                f"api/integrations/{response['id']}/sync",
                200
            )
            
            if success2:
                print(f"   Integration sync result: {response2.get('success', False)}")
            
            return success and success2
        
        return success

    def test_user_activity_analytics(self):
        """Test user activity analytics"""
        success, response = self.run_test(
            "Get User Activity Analytics",
            "GET",
            "api/analytics/user-activity?limit=100",
            200
        )
        if success:
            required_fields = ['total_activities', 'unique_users', 'activity_by_type', 
                             'activity_by_hour', 'device_breakdown', 'user_engagement']
            for field in required_fields:
                if field not in response:
                    print(f"   Warning: Missing field '{field}' in user activity analytics")
                else:
                    if field == 'total_activities':
                        print(f"   Total activities tracked: {response[field]}")
                    elif field == 'unique_users':
                        print(f"   Unique users: {response[field]}")
                    elif field == 'user_engagement':
                        engagement = response[field]
                        print(f"   Average session duration: {engagement.get('avg_session_duration_minutes', 0)} minutes")
                        print(f"   Average pages per session: {engagement.get('avg_pages_per_session', 0)}")
        
        # Test filtering by user type
        success2, response2 = self.run_test(
            "Get Member Activity Analytics",
            "GET",
            "api/analytics/user-activity?user_type=member",
            200
        )
        
        # Test filtering by activity type
        success3, response3 = self.run_test(
            "Get Page View Analytics",
            "GET",
            "api/analytics/user-activity?activity_type=page_view",
            200
        )
        
        return success and success2 and success3

    def test_real_time_events(self):
        """Test real-time events system"""
        # Get all events
        success, response = self.run_test(
            "Get Real-Time Events",
            "GET",
            "api/analytics/real-time-events?limit=20",
            200
        )
        if success and 'events' in response:
            print(f"   Found {response['total']} total real-time events")
            print(f"   Retrieved {len(response['events'])} events")
            
            # Show event types and severities
            event_types = {}
            severities = {}
            for event in response['events']:
                event_type = event.get('event_type', 'unknown')
                severity = event.get('severity', 'unknown')
                event_types[event_type] = event_types.get(event_type, 0) + 1
                severities[severity] = severities.get(severity, 0) + 1
            print(f"   Event types: {event_types}")
            print(f"   Severities: {severities}")
        
        # Test filtering by event type
        for event_type in ["user_action", "system_alert", "security_incident"]:
            success2, response2 = self.run_test(
                f"Get {event_type.replace('_', ' ').title()} Events",
                "GET",
                f"api/analytics/real-time-events?event_type={event_type}&limit=5",
                200
            )
            if not success2:
                return False
        
        # Test filtering by severity
        for severity in ["info", "warning", "error", "critical"]:
            success3, response3 = self.run_test(
                f"Get {severity.title()} Severity Events",
                "GET",
                f"api/analytics/real-time-events?severity={severity}&limit=5",
                200
            )
            if not success3:
                return False
        
        return success

    def test_create_real_time_event(self):
        """Test creating a real-time event"""
        event_data = {
            "event_type": "system_alert",
            "severity": "warning",
            "source": "api_testing",
            "title": "Test System Alert",
            "description": "This is a test system alert created during API testing",
            "data": {"test": True, "created_by": "api_test"},
            "requires_action": False,
            "resolved": False
        }
        
        success, response = self.run_test(
            "Create Real-Time Event",
            "POST",
            "api/analytics/real-time-events",
            200,
            data=event_data
        )
        
        if success and 'id' in response:
            print(f"   Created real-time event with ID: {response['id']}")
        
        return success

    def test_data_retention_policies(self):
        """Test data retention policies management"""
        # Get all policies
        success, response = self.run_test(
            "Get Data Retention Policies",
            "GET",
            "api/data-retention/policies",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} data retention policies")
            
            # Show data categories and statuses
            categories = {}
            statuses = {}
            for policy in response:
                category = policy.get('data_category', 'unknown')
                status = policy.get('status', 'unknown')
                categories[category] = categories.get(category, 0) + 1
                statuses[status] = statuses.get(status, 0) + 1
            print(f"   Data categories: {categories}")
            print(f"   Policy statuses: {statuses}")
            
            # Show retention periods
            for policy in response[:3]:  # Show first 3 policies
                print(f"   - {policy.get('policy_name', 'Unknown')}: {policy.get('retention_period_days', 0)} days")
        
        # Test filtering by data category
        for category in ["member_data", "gaming_logs", "audit_logs"]:
            success2, response2 = self.run_test(
                f"Get {category.replace('_', ' ').title()} Policies",
                "GET",
                f"api/data-retention/policies?data_category={category}",
                200
            )
            if not success2:
                return False
        
        # Test filtering by status
        success3, response3 = self.run_test(
            "Get Active Retention Policies",
            "GET",
            "api/data-retention/policies?status=active",
            200
        )
        
        return success and success3

    def test_create_data_retention_policy(self):
        """Test creating a data retention policy"""
        policy_data = {
            "policy_name": "Test Data Retention Policy",
            "data_category": "test_data",
            "retention_period_days": 365,
            "archive_after_days": 180,
            "auto_delete": True,
            "encryption_required": True,
            "backup_required": True,
            "legal_basis": "Test policy for API testing purposes",
            "status": "active",
            "next_review_date": "2025-12-31T23:59:59Z"
        }
        
        success, response = self.run_test(
            "Create Data Retention Policy",
            "POST",
            "api/data-retention/policies",
            200,
            data=policy_data
        )
        
        if success and 'id' in response:
            print(f"   Created data retention policy with ID: {response['id']}")
        
        return success

    # COMPREHENSIVE RUNTIME ERROR AUDIT & DATA STRUCTURE VALIDATION TESTS
    
    def validate_array_structure(self, data, field_name, context=""):
        """Validate that a field is an array and supports array methods"""
        if not isinstance(data, list):
            print(f"   ❌ CRITICAL: {context}{field_name} is not an array! Type: {type(data)}")
            print(f"      This will cause '.filter is not a function' errors!")
            return False
        print(f"   ✅ {context}{field_name} is valid array with {len(data)} items")
        return True
    
    def validate_object_structure(self, data, required_fields, context=""):
        """Validate object has required fields"""
        missing_fields = []
        for field in required_fields:
            if field not in data:
                missing_fields.append(field)
        
        if missing_fields:
            print(f"   ⚠️  {context}Missing fields: {missing_fields}")
            return False
        return True
    
    def test_compliance_dashboard_data_structure(self):
        """CRITICAL: Test ComplianceDashboard component data structure"""
        print("\n🔍 CRITICAL TEST: ComplianceDashboard Data Structure Validation")
        
        success, response = self.run_test(
            "Compliance Reports Data Structure",
            "GET",
            "api/compliance/reports?limit=20",
            200
        )
        
        if not success:
            return False
        
        # Validate reports is an array
        if 'reports' not in response:
            print("   ❌ CRITICAL: Missing 'reports' field in compliance response!")
            return False
        
        if not self.validate_array_structure(response['reports'], 'reports', 'ComplianceDashboard: '):
            return False
        
        # Test data retention policies array
        success2, response2 = self.run_test(
            "Data Retention Policies Array Structure",
            "GET",
            "api/data-retention/policies",
            200
        )
        
        if success2:
            if not self.validate_array_structure(response2, 'dataRetentionPolicies', 'ComplianceDashboard: '):
                return False
        
        return success and success2
    
    def test_notifications_management_data_structure(self):
        """CRITICAL: Test NotificationsManagement component data structure"""
        print("\n🔍 CRITICAL TEST: NotificationsManagement Data Structure Validation")
        
        success, response = self.run_test(
            "Notifications Array Structure",
            "GET",
            "api/notifications?limit=50",
            200
        )
        
        if not success:
            return False
        
        # Validate notifications is an array
        if 'notifications' not in response:
            print("   ❌ CRITICAL: Missing 'notifications' field!")
            return False
        
        if not self.validate_array_structure(response['notifications'], 'notifications', 'NotificationsManagement: '):
            return False
        
        # Test notification templates array
        success2, response2 = self.run_test(
            "Notification Templates Array Structure",
            "GET",
            "api/notifications/templates",
            200
        )
        
        if success2:
            if not self.validate_array_structure(response2, 'templates', 'NotificationsManagement: '):
                return False
        
        return success and success2
    
    def test_enterprise_dashboard_data_structure(self):
        """CRITICAL: Test EnterpriseDashboard component data structure"""
        print("\n🔍 CRITICAL TEST: EnterpriseDashboard Data Structure Validation")
        
        # Test integrations array
        success, response = self.run_test(
            "System Integrations Array Structure",
            "GET",
            "api/integrations",
            200
        )
        
        if success:
            if not self.validate_array_structure(response, 'integrations', 'EnterpriseDashboard: '):
                return False
        
        # Test real-time events array
        success2, response2 = self.run_test(
            "Real-time Events Array Structure",
            "GET",
            "api/analytics/real-time-events?limit=20",
            200
        )
        
        if success2 and 'events' in response2:
            if not self.validate_array_structure(response2['events'], 'events', 'EnterpriseDashboard: '):
                return False
        
        # Test user activity analytics
        success3, response3 = self.run_test(
            "User Activity Analytics Structure",
            "GET",
            "api/analytics/user-activity",
            200
        )
        
        return success and success2 and success3
    
    def test_all_dashboard_sections_data_structure(self):
        """CRITICAL: Test all major dashboard sections for array structure"""
        print("\n🔍 COMPREHENSIVE TEST: All Dashboard Sections Data Structure")
        
        all_tests_passed = True
        
        # Test Members section
        success, response = self.run_test(
            "Members Array Structure",
            "GET",
            "api/members?limit=20",
            200
        )
        if success and 'members' in response:
            if not self.validate_array_structure(response['members'], 'members', 'Members Section: '):
                all_tests_passed = False
        else:
            all_tests_passed = False
        
        # Test Gaming Sessions
        success, response = self.run_test(
            "Gaming Sessions Array Structure",
            "GET",
            "api/gaming/sessions?limit=20",
            200
        )
        if success and 'sessions' in response:
            if not self.validate_array_structure(response['sessions'], 'sessions', 'Gaming Section: '):
                all_tests_passed = False
        else:
            all_tests_passed = False
        
        # Test Gaming Packages
        success, response = self.run_test(
            "Gaming Packages Array Structure",
            "GET",
            "api/gaming/packages",
            200
        )
        if success:
            if not self.validate_array_structure(response, 'packages', 'Gaming Section: '):
                all_tests_passed = False
        else:
            all_tests_passed = False
        
        # Test Rewards
        success, response = self.run_test(
            "Rewards Array Structure",
            "GET",
            "api/rewards?limit=20",
            200
        )
        if success and isinstance(response, dict) and 'rewards' in response:
            if not self.validate_array_structure(response['rewards'], 'rewards', 'Rewards Section: '):
                all_tests_passed = False
        elif success and isinstance(response, list):
            if not self.validate_array_structure(response, 'rewards', 'Rewards Section: '):
                all_tests_passed = False
        
        # Test Staff Members
        success, response = self.run_test(
            "Staff Members Array Structure",
            "GET",
            "api/staff/members?limit=20",
            200
        )
        if success and 'staff_members' in response:
            if not self.validate_array_structure(response['staff_members'], 'staff_members', 'Staff Section: '):
                all_tests_passed = False
        else:
            all_tests_passed = False
        
        # Test Marketing Campaigns
        success, response = self.run_test(
            "Marketing Campaigns Array Structure",
            "GET",
            "api/marketing/campaigns?limit=20",
            200
        )
        if success and 'campaigns' in response:
            if not self.validate_array_structure(response['campaigns'], 'campaigns', 'Marketing Section: '):
                all_tests_passed = False
        else:
            all_tests_passed = False
        
        return all_tests_passed
    
    def test_analytics_data_structure(self):
        """CRITICAL: Test Analytics section data structures"""
        print("\n🔍 CRITICAL TEST: Analytics Data Structure Validation")
        
        all_tests_passed = True
        
        # Test user activity analytics
        success, response = self.run_test(
            "User Activity Analytics Data Structure",
            "GET",
            "api/analytics/user-activity",
            200
        )
        if success:
            required_fields = ['total_activities', 'unique_users', 'activity_by_type', 'activity_by_hour']
            if not self.validate_object_structure(response, required_fields, 'Analytics: '):
                all_tests_passed = False
        else:
            all_tests_passed = False
        
        # Test real-time events
        success, response = self.run_test(
            "Real-time Events Data Structure",
            "GET",
            "api/analytics/real-time-events?limit=20",
            200
        )
        if success and 'events' in response:
            if not self.validate_array_structure(response['events'], 'events', 'Analytics: '):
                all_tests_passed = False
        else:
            all_tests_passed = False
        
        return all_tests_passed
    
    def test_dashboard_metrics_structure(self):
        """CRITICAL: Test Dashboard metrics data structure"""
        print("\n🔍 CRITICAL TEST: Dashboard Metrics Structure Validation")
        
        success, response = self.run_test(
            "Dashboard Metrics Structure",
            "GET",
            "api/dashboard/metrics",
            200
        )
        
        if not success:
            return False
        
        # Validate required fields exist
        required_fields = ['total_members', 'members_by_tier', 'active_sessions', 'top_games']
        if not self.validate_object_structure(response, required_fields, 'Dashboard: '):
            return False
        
        # Validate top_games is an array
        if 'top_games' in response:
            if not self.validate_array_structure(response['top_games'], 'top_games', 'Dashboard: '):
                return False
        
        # Validate members_by_tier is an object
        if 'members_by_tier' in response:
            if not isinstance(response['members_by_tier'], dict):
                print("   ❌ CRITICAL: members_by_tier is not an object!")
                return False
            print("   ✅ members_by_tier is valid object")
        
        return True
    
    def test_comprehensive_runtime_error_prevention(self):
        """COMPREHENSIVE: Test all endpoints for runtime error prevention"""
        print("\n🔍 COMPREHENSIVE RUNTIME ERROR PREVENTION TEST")
        
        all_tests_passed = True
        
        # List of all critical endpoints that frontend components call
        critical_endpoints = [
            ("api/compliance/reports", "ComplianceDashboard"),
            ("api/data-retention/policies", "ComplianceDashboard"),
            ("api/notifications", "NotificationsManagement"),
            ("api/integrations", "EnterpriseDashboard"),
            ("api/analytics/real-time-events", "EnterpriseDashboard"),
            ("api/analytics/user-activity", "Analytics"),
            ("api/gaming/sessions", "Gaming"),
            ("api/gaming/packages", "Gaming"),
            ("api/rewards", "Rewards"),
            ("api/members", "Members"),
            ("api/staff/members", "Staff"),
            ("api/marketing/campaigns", "Marketing"),
            ("api/dashboard/metrics", "Dashboard")
        ]
        
        for endpoint, component in critical_endpoints:
            print(f"\n   Testing {component} endpoint: {endpoint}")
            success, response = self.run_test(
                f"{component} Runtime Error Check",
                "GET",
                f"{endpoint}?limit=10",
                200
            )
            
            if not success:
                print(f"   ❌ CRITICAL: {component} endpoint failed!")
                all_tests_passed = False
                continue
            
            # Check for common array fields that cause .filter errors
            array_fields_to_check = []
            
            if 'reports' in response:
                array_fields_to_check.append('reports')
            if 'notifications' in response:
                array_fields_to_check.append('notifications')
            if 'events' in response:
                array_fields_to_check.append('events')
            if 'sessions' in response:
                array_fields_to_check.append('sessions')
            if 'members' in response:
                array_fields_to_check.append('members')
            if 'staff_members' in response:
                array_fields_to_check.append('staff_members')
            if 'campaigns' in response:
                array_fields_to_check.append('campaigns')
            if 'rewards' in response:
                array_fields_to_check.append('rewards')
            if 'top_games' in response:
                array_fields_to_check.append('top_games')
            
            # If response itself is an array (like integrations, packages, policies)
            if isinstance(response, list):
                if not self.validate_array_structure(response, f'{component}_data', f'{component}: '):
                    all_tests_passed = False
            
            # Check each array field
            for field in array_fields_to_check:
                if not self.validate_array_structure(response[field], field, f'{component}: '):
                    all_tests_passed = False
        
        return all_tests_passed
    
    def test_casino_floor_backend_support(self):
        """Test Casino Floor system backend support and compatibility"""
        print("\n🎰 CASINO FLOOR BACKEND SUPPORT TESTING")
        print("=" * 60)
        
        all_tests_passed = True
        
        # 1. Verify existing gaming endpoints still work
        print("\n1️⃣ Testing existing gaming endpoints after Casino Floor implementation...")
        
        # Test gaming sessions endpoint
        success, response = self.run_test(
            "Gaming Sessions API (Post Casino Floor)",
            "GET",
            "api/gaming/sessions?limit=10",
            200
        )
        if success and 'sessions' in response:
            print(f"   ✅ Gaming sessions API working - {response['total']} sessions found")
            # Validate data structure compatibility
            if response['sessions']:
                session = response['sessions'][0]
                required_fields = ['id', 'member_id', 'game_type', 'buy_in_amount', 'status']
                missing_fields = [field for field in required_fields if field not in session]
                if missing_fields:
                    print(f"   ⚠️  Gaming session missing fields: {missing_fields}")
                    all_tests_passed = False
                else:
                    print("   ✅ Gaming session data structure compatible")
        else:
            all_tests_passed = False
        
        # Test gaming packages endpoint
        success, response = self.run_test(
            "Gaming Packages API (Post Casino Floor)",
            "GET",
            "api/gaming/packages",
            200
        )
        if success and isinstance(response, list):
            print(f"   ✅ Gaming packages API working - {len(response)} packages found")
            # Validate data structure compatibility
            if response:
                package = response[0]
                required_fields = ['id', 'name', 'price', 'credits', 'validity_hours', 'tier_access']
                missing_fields = [field for field in required_fields if field not in package]
                if missing_fields:
                    print(f"   ⚠️  Gaming package missing fields: {missing_fields}")
                    all_tests_passed = False
                else:
                    print("   ✅ Gaming package data structure compatible")
        else:
            all_tests_passed = False
        
        # 2. Check authentication and permissions for casino floor access
        print("\n2️⃣ Testing authentication and permissions for casino floor access...")
        
        # Test SuperAdmin access (should have casino_floor_access)
        if self.user_info and self.user_info.get('role') == 'SuperAdmin':
            permissions = self.user_info.get('permissions', [])
            if 'casino_floor_access' in permissions or '*' in permissions:
                print("   ✅ SuperAdmin has casino floor access permissions")
            else:
                print("   ⚠️  SuperAdmin missing casino_floor_access permission")
                all_tests_passed = False
        
        # Test Manager login and permissions
        success = self.test_login("manager", "manager123")
        if success:
            manager_permissions = self.user_info.get('permissions', [])
            if 'casino_floor_access' in manager_permissions:
                print("   ✅ Manager has casino floor access permissions")
            else:
                print("   ⚠️  Manager missing casino_floor_access permission")
                all_tests_passed = False
        
        # Switch back to SuperAdmin for remaining tests
        self.test_login("superadmin", "admin123")
        
        # 3. Test data consistency across Gaming Management and Casino Floor systems
        print("\n3️⃣ Testing data consistency across Gaming Management and Casino Floor...")
        
        # Get gaming sessions data
        success, gaming_data = self.run_test(
            "Gaming Data for Consistency Check",
            "GET",
            "api/gaming/sessions?limit=50",
            200
        )
        
        if success and 'sessions' in gaming_data:
            sessions = gaming_data['sessions']
            print(f"   ✅ Retrieved {len(sessions)} gaming sessions for consistency check")
            
            # Check for data consistency requirements
            member_ids = set()
            game_types = set()
            statuses = set()
            
            for session in sessions:
                if 'member_id' in session:
                    member_ids.add(session['member_id'])
                if 'game_type' in session:
                    game_types.add(session['game_type'])
                if 'status' in session:
                    statuses.add(session['status'])
            
            print(f"   ✅ Data consistency check: {len(member_ids)} unique members, {len(game_types)} game types, {len(statuses)} statuses")
            
            # Verify member data exists for gaming sessions
            if member_ids:
                sample_member_id = list(member_ids)[0]
                success, member_data = self.run_test(
                    "Member Data Consistency Check",
                    "GET",
                    f"api/members/{sample_member_id}",
                    200
                )
                if success:
                    print("   ✅ Member data consistency verified")
                else:
                    print("   ⚠️  Member data consistency issue detected")
                    all_tests_passed = False
        else:
            all_tests_passed = False
        
        # 4. Validate mock data structures compatibility
        print("\n4️⃣ Validating mock data structures for Casino Floor compatibility...")
        
        # The Casino Floor component uses mock data, but we need to ensure it's compatible
        # with the backend gaming data structures. Since it's frontend-only, we validate
        # that the backend data can support the Casino Floor requirements.
        
        # Check if gaming sessions have required fields for Casino Floor
        if success and sessions:
            casino_floor_required_fields = ['member_id', 'game_type', 'buy_in_amount', 'status', 'session_start']
            for session in sessions[:3]:  # Check first 3 sessions
                missing_fields = [field for field in casino_floor_required_fields if field not in session]
                if missing_fields:
                    print(f"   ⚠️  Session {session.get('id', 'unknown')} missing Casino Floor fields: {missing_fields}")
                    all_tests_passed = False
            
            if all_tests_passed:
                print("   ✅ Gaming session data structure compatible with Casino Floor requirements")
        
        # 5. Ensure no regressions in existing gaming functionality
        print("\n5️⃣ Testing for regressions in existing gaming functionality...")
        
        # Test all core gaming endpoints
        gaming_tests = [
            ("Gaming Sessions Pagination", "api/gaming/sessions?skip=0&limit=5"),
            ("Gaming Sessions Status Filter", "api/gaming/sessions?status=active"),
            ("Gaming Sessions Status Filter - Completed", "api/gaming/sessions?status=completed"),
            ("Gaming Packages List", "api/gaming/packages"),
        ]
        
        regression_found = False
        for test_name, endpoint in gaming_tests:
            success, response = self.run_test(
                test_name,
                "GET",
                endpoint,
                200
            )
            if not success:
                print(f"   ❌ REGRESSION: {test_name} failed")
                regression_found = True
                all_tests_passed = False
            else:
                print(f"   ✅ {test_name} working correctly")
        
        if not regression_found:
            print("   ✅ No regressions detected in gaming functionality")
        
        # Test gaming package creation (if user has permissions)
        if self.user_info and self.user_info.get('role') in ['SuperAdmin', 'GeneralAdmin', 'Manager']:
            test_package = {
                "name": "Casino Floor Test Package",
                "description": "Test package for Casino Floor compatibility",
                "price": 500.0,
                "credits": 600.0,
                "validity_hours": 4,
                "tier_access": ["Ruby", "Sapphire"],
                "is_active": True
            }
            
            success, response = self.run_test(
                "Gaming Package Creation (Regression Test)",
                "POST",
                "api/gaming/packages",
                200,
                data=test_package
            )
            if success:
                print("   ✅ Gaming package creation working correctly")
            else:
                print("   ❌ REGRESSION: Gaming package creation failed")
                all_tests_passed = False
        
        print("\n" + "=" * 60)
        if all_tests_passed:
            print("🎉 CASINO FLOOR BACKEND SUPPORT: ALL TESTS PASSED")
            print("✅ Existing gaming endpoints working correctly")
            print("✅ Authentication and permissions properly configured")
            print("✅ Data consistency maintained")
            print("✅ Mock data structures compatible")
            print("✅ No regressions in gaming functionality")
        else:
            print("⚠️  CASINO FLOOR BACKEND SUPPORT: SOME ISSUES DETECTED")
            print("Please review the issues above")
        
        return all_tests_passed

def main():
    print("🎰 COMPREHENSIVE RUNTIME ERROR AUDIT & FUNCTIONALITY TESTING")
    print("🔍 Focus: Preventing '.filter is not a function' and data structure errors")
    print("=" * 80)
    
    # Setup - Use the public endpoint from frontend .env
    tester = BallyCasinoAPITester("https://casino-enterprise.preview.emergentagent.com")
    
    # Test 1: Initialize Sample Data
    print("\n📋 DATA INITIALIZATION")
    if not tester.test_initialize_sample_data():
        print("❌ Sample data initialization failed")
        return 1
    
    # Test 2: Authentication
    print("\n📋 AUTHENTICATION")
    if not tester.test_login("superadmin", "admin123"):
        print("❌ SuperAdmin login failed")
        return 1
    
    # CRITICAL RUNTIME ERROR PREVENTION TESTS
    print("\n" + "🚨" * 20)
    print("🚨 CRITICAL RUNTIME ERROR PREVENTION TESTS")
    print("🚨" * 20)
    
    critical_tests_passed = True
    
    # Test 3: CRITICAL - ComplianceDashboard Data Structure
    if not tester.test_compliance_dashboard_data_structure():
        critical_tests_passed = False
    
    # Test 4: CRITICAL - NotificationsManagement Data Structure  
    if not tester.test_notifications_management_data_structure():
        critical_tests_passed = False
    
    # Test 5: CRITICAL - EnterpriseDashboard Data Structure
    if not tester.test_enterprise_dashboard_data_structure():
        critical_tests_passed = False
    
    # Test 6: CRITICAL - All Dashboard Sections
    if not tester.test_all_dashboard_sections_data_structure():
        critical_tests_passed = False
    
    # Test 7: CRITICAL - Analytics Data Structure
    if not tester.test_analytics_data_structure():
        critical_tests_passed = False
    
    # Test 8: CRITICAL - Dashboard Metrics Structure
    if not tester.test_dashboard_metrics_structure():
        critical_tests_passed = False
    
    # Test 9: COMPREHENSIVE - All Endpoints Runtime Error Prevention
    if not tester.test_comprehensive_runtime_error_prevention():
        critical_tests_passed = False
    
    # FUNCTIONAL VALIDATION TESTS
    print("\n" + "✅" * 20)
    print("✅ FUNCTIONAL VALIDATION TESTS")
    print("✅" * 20)
    
    # Test key functionality to ensure no runtime errors
    print("\n📋 DASHBOARD FUNCTIONALITY")
    tester.test_dashboard_metrics()
    
    print("\n📋 MEMBER MANAGEMENT FUNCTIONALITY")
    tester.test_get_members()
    tester.test_filter_members_by_tier()
    
    print("\n📋 GAMING FUNCTIONALITY")
    tester.test_gaming_sessions()
    tester.test_gaming_packages()
    
    print("\n📋 REWARDS FUNCTIONALITY")
    # Test rewards endpoint if it exists
    success, response = tester.run_test(
        "Rewards Functionality",
        "GET",
        "api/rewards?limit=10",
        200
    )
    
    print("\n📋 MARKETING FUNCTIONALITY")
    tester.test_marketing_dashboard()
    tester.test_marketing_campaigns()
    
    print("\n📋 STAFF FUNCTIONALITY")
    tester.test_staff_dashboard()
    tester.test_staff_members()
    
    print("\n📋 ENTERPRISE FUNCTIONALITY")
    tester.test_notifications_system()
    tester.test_compliance_reports()
    tester.test_system_integrations()
    
    print("\n📋 ANALYTICS FUNCTIONALITY")
    tester.test_user_activity_analytics()
    tester.test_real_time_events()
    
    # Print final results
    print("\n" + "=" * 80)
    print(f"📊 COMPREHENSIVE RUNTIME ERROR AUDIT RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if critical_tests_passed:
        print("\n🎉 CRITICAL SUCCESS: All data structure validation tests passed!")
        print("✅ No '.filter is not a function' errors expected")
        print("✅ All arrays properly structured")
        print("✅ All objects have required properties")
        print("✅ Components should render without crashing")
    else:
        print("\n🚨 CRITICAL FAILURE: Data structure validation failed!")
        print("❌ Runtime errors likely in frontend components")
        print("❌ '.filter is not a function' errors possible")
        print("❌ Components may crash during rendering")
    
    if tester.tests_passed == tester.tests_run:
        print("\n🎉 ALL TESTS PASSED: Backend is bulletproof and ready!")
        return 0
    else:
        failed = tester.tests_run - tester.tests_passed
        print(f"\n⚠️  {failed} test(s) failed. Check issues above.")
        return 1

def test_casino_floor_backend_support():
    """Test Casino Floor system backend support specifically"""
    print("🎰 CASINO FLOOR BACKEND SUPPORT TESTING")
    print("=" * 60)
    
    tester = BallyCasinoAPITester()
    
    # Initialize sample data
    if not tester.test_initialize_sample_data():
        print("❌ Failed to initialize sample data")
        return 1
    
    # Login as SuperAdmin
    if not tester.test_login("superadmin", "admin123"):
        print("❌ SuperAdmin login failed")
        return 1
    
    # Run Casino Floor specific tests
    success = tester.test_casino_floor_backend_support()
    
    print(f"\n📊 Casino Floor Backend Support Test Results:")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if success:
        print("\n🎉 CASINO FLOOR BACKEND SUPPORT: ALL TESTS PASSED!")
        print("✅ Gaming endpoints working correctly after Casino Floor implementation")
        print("✅ Authentication and permissions properly configured")
        print("✅ Data consistency maintained across systems")
        print("✅ Mock data structures compatible")
        print("✅ No regressions in existing gaming functionality")
        return 0
    else:
        print("\n⚠️  CASINO FLOOR BACKEND SUPPORT: SOME ISSUES DETECTED")
        print("Please review the issues above")
        return 1

if __name__ == "__main__":
    # Check if we should run Casino Floor specific tests
    if len(sys.argv) > 1 and sys.argv[1] == "casino_floor":
        sys.exit(test_casino_floor_backend_support())
    else:
        sys.exit(main())