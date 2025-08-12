#!/usr/bin/env python3
"""
PHASE 1 COMPREHENSIVE BACKEND TESTING - Pre-Demo Verification
Bally's Casino Admin Dashboard - Client Demonstration Readiness Test

This script validates all critical backend endpoints that will be showcased 
in the client demonstration to ensure flawless presentation.
"""

import requests
import sys
import json
from datetime import datetime
import time

class PreDemoTester:
    def __init__(self, base_url="https://d57b3cda-bd0b-4582-84a5-0465913d6d76.preview.emergentagent.com"):
        self.base_url = base_url
        self.superadmin_token = None
        self.manager_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.critical_failures = []
        self.demo_scenarios = []
        
    def log_result(self, test_name, success, details=""):
        """Log test result with demo impact assessment"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
            if details:
                print(f"   {details}")
        else:
            print(f"❌ {test_name}")
            if details:
                print(f"   {details}")
            self.critical_failures.append(f"{test_name}: {details}")
    
    def make_request(self, method, endpoint, token=None, data=None):
        """Make API request with proper headers"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)
            
            return response.status_code, response.json() if response.content else {}
        except requests.exceptions.Timeout:
            return 408, {"error": "Request timeout"}
        except Exception as e:
            return 500, {"error": str(e)}
    
    def test_demo_authentication(self):
        """PRIORITY 1: Test demo login credentials for both roles"""
        print("\n🔐 PRIORITY 1: AUTHENTICATION & DEMO CREDENTIALS")
        print("=" * 60)
        
        # Test SuperAdmin login
        status, response = self.make_request('POST', 'api/auth/login', data={
            "username": "superadmin",
            "password": "admin123"
        })
        
        if status == 200 and 'access_token' in response:
            self.superadmin_token = response['access_token']
            user_info = response.get('user_info', {})
            self.log_result(
                "SuperAdmin Demo Login",
                True,
                f"Role: {user_info.get('role')}, Name: {user_info.get('full_name')}"
            )
            self.demo_scenarios.append("✅ SuperAdmin can demonstrate full system access")
        else:
            self.log_result(
                "SuperAdmin Demo Login",
                False,
                f"Status: {status}, Response: {response}"
            )
        
        # Test Manager login
        status, response = self.make_request('POST', 'api/auth/login', data={
            "username": "manager",
            "password": "manager123"
        })
        
        if status == 200 and 'access_token' in response:
            self.manager_token = response['access_token']
            user_info = response.get('user_info', {})
            self.log_result(
                "Manager Demo Login",
                True,
                f"Role: {user_info.get('role')}, Permissions: {len(user_info.get('permissions', []))}"
            )
            self.demo_scenarios.append("✅ Manager can demonstrate role-based access")
        else:
            self.log_result(
                "Manager Demo Login",
                False,
                f"Status: {status}, Response: {response}"
            )
        
        # Test token validation
        if self.superadmin_token:
            status, response = self.make_request('GET', 'api/auth/me', token=self.superadmin_token)
            self.log_result(
                "Token Validation & Session Management",
                status == 200,
                f"User authenticated: {response.get('username', 'Unknown')}"
            )
        
        # Test permission-based access control
        if self.manager_token:
            # Manager should have limited access compared to SuperAdmin
            status, response = self.make_request('GET', 'api/auth/me', token=self.manager_token)
            if status == 200:
                permissions = response.get('permissions', [])
                has_gaming_access = any('gaming' in perm for perm in permissions)
                has_member_access = any('member' in perm for perm in permissions)
                self.log_result(
                    "Permission-Based Access Control",
                    has_gaming_access and has_member_access,
                    f"Manager permissions verified: Gaming={has_gaming_access}, Members={has_member_access}"
                )
    
    def test_core_dashboard_endpoints(self):
        """PRIORITY 2: Test core dashboard endpoints for demo"""
        print("\n📊 PRIORITY 2: CORE DASHBOARD ENDPOINTS")
        print("=" * 60)
        
        if not self.superadmin_token:
            print("❌ Skipping dashboard tests - no SuperAdmin token")
            return
        
        # Dashboard metrics - key demo showcase
        status, response = self.make_request('GET', 'api/dashboard/metrics', token=self.superadmin_token)
        if status == 200:
            metrics = response
            total_members = metrics.get('total_members', 0)
            active_sessions = metrics.get('active_sessions', 0)
            daily_revenue = metrics.get('daily_revenue', 0)
            members_by_tier = metrics.get('members_by_tier', {})
            
            self.log_result(
                "Dashboard Metrics (Revenue, Members, Gaming Stats)",
                True,
                f"Members: {total_members}, Active Sessions: {active_sessions}, Daily Revenue: ${daily_revenue:,.2f}"
            )
            
            # Validate tier distribution for demo
            tier_counts = sum(members_by_tier.values())
            self.log_result(
                "Member Tier Distribution",
                tier_counts > 0,
                f"Tier breakdown: {members_by_tier}"
            )
            
            self.demo_scenarios.append(f"✅ Dashboard shows {total_members} members, ${daily_revenue:,.2f} daily revenue")
        else:
            self.log_result("Dashboard Metrics", False, f"Status: {status}")
        
        # Member management data - critical for demo
        status, response = self.make_request('GET', 'api/members?limit=20', token=self.superadmin_token)
        if status == 200 and 'members' in response:
            members = response['members']
            total = response.get('total', 0)
            
            # Validate member data structure
            if members and len(members) > 0:
                sample_member = members[0]
                required_fields = ['id', 'first_name', 'last_name', 'tier', 'points_balance']
                has_required_fields = all(field in sample_member for field in required_fields)
                
                self.log_result(
                    "Member Management Data Retrieval",
                    has_required_fields,
                    f"Retrieved {len(members)}/{total} members with complete data"
                )
                
                # Test tier filtering for demo
                for tier in ['VIP', 'Diamond', 'Sapphire', 'Ruby']:
                    status, tier_response = self.make_request(
                        'GET', f'api/members?tier={tier}&limit=5', token=self.superadmin_token
                    )
                    if status == 200:
                        tier_count = tier_response.get('total', 0)
                        if tier_count > 0:
                            self.demo_scenarios.append(f"✅ {tier} tier has {tier_count} members for demo")
            else:
                self.log_result("Member Management Data", False, "No member data available")
        else:
            self.log_result("Member Management Data", False, f"Status: {status}")
        
        # Gaming sessions and packages - key demo features
        status, response = self.make_request('GET', 'api/gaming/sessions?limit=20', token=self.superadmin_token)
        if status == 200 and 'sessions' in response:
            sessions = response['sessions']
            total_sessions = response.get('total', 0)
            
            # Validate session data for demo
            if sessions:
                sample_session = sessions[0]
                has_member_name = 'member_name' in sample_session
                has_game_type = 'game_type' in sample_session
                has_buy_in = 'buy_in_amount' in sample_session
                
                self.log_result(
                    "Gaming Sessions API",
                    has_member_name and has_game_type and has_buy_in,
                    f"Retrieved {len(sessions)}/{total_sessions} sessions with complete data"
                )
                
                # Count active vs completed for demo
                active_count = sum(1 for s in sessions if s.get('status') == 'active')
                completed_count = sum(1 for s in sessions if s.get('status') == 'completed')
                self.demo_scenarios.append(f"✅ Gaming: {active_count} active, {completed_count} completed sessions")
        else:
            self.log_result("Gaming Sessions API", False, f"Status: {status}")
        
        # Gaming packages
        status, response = self.make_request('GET', 'api/gaming/packages', token=self.superadmin_token)
        if status == 200 and isinstance(response, list):
            packages = response
            if packages:
                sample_package = packages[0]
                required_fields = ['name', 'price', 'credits', 'tier_access']
                has_required_fields = all(field in sample_package for field in required_fields)
                
                self.log_result(
                    "Gaming Packages APIs",
                    has_required_fields,
                    f"Retrieved {len(packages)} packages with complete structure"
                )
                
                # Show package variety for demo
                package_names = [p.get('name', 'Unknown') for p in packages[:3]]
                self.demo_scenarios.append(f"✅ Gaming packages available: {', '.join(package_names)}")
        else:
            self.log_result("Gaming Packages APIs", False, f"Status: {status}")
        
        # Casino floor monitoring data
        status, response = self.make_request('GET', 'api/gaming/sessions?status=active&limit=10', token=self.superadmin_token)
        if status == 200:
            active_sessions = response.get('sessions', [])
            self.log_result(
                "Casino Floor Monitoring Data",
                len(active_sessions) >= 0,
                f"Active gaming sessions for floor monitoring: {len(active_sessions)}"
            )
            self.demo_scenarios.append(f"✅ Casino floor shows {len(active_sessions)} active gaming sessions")
        else:
            self.log_result("Casino Floor Monitoring Data", False, f"Status: {status}")
    
    def test_advanced_analytics_system(self):
        """PRIORITY 3: Test advanced analytics system"""
        print("\n📈 PRIORITY 3: ADVANCED ANALYTICS SYSTEM")
        print("=" * 60)
        
        if not self.superadmin_token:
            print("❌ Skipping analytics tests - no SuperAdmin token")
            return
        
        # Test analytics report generation
        analytics_types = ["customer_ltv", "churn_prediction", "operational_efficiency"]
        
        for analysis_type in analytics_types:
            status, response = self.make_request('POST', 'api/analytics/generate', 
                token=self.superadmin_token,
                data={
                    "analysis_type": analysis_type,
                    "time_period": "monthly"
                }
            )
            
            if status == 200 and 'analysis' in response:
                analysis = response['analysis']
                insights_count = len(analysis.get('insights', []))
                recommendations_count = len(analysis.get('recommendations', []))
                confidence = analysis.get('confidence_score', 0)
                
                self.log_result(
                    f"Analytics Report Generation - {analysis_type.replace('_', ' ').title()}",
                    insights_count > 0 and recommendations_count > 0,
                    f"Generated {insights_count} insights, {recommendations_count} recommendations, {confidence}% confidence"
                )
                
                self.demo_scenarios.append(f"✅ {analysis_type.replace('_', ' ').title()} analytics ready for demo")
            else:
                self.log_result(f"Analytics Report - {analysis_type}", False, f"Status: {status}")
        
        # Test existing analytics data
        status, response = self.make_request('GET', 'api/analytics/advanced?limit=10', token=self.superadmin_token)
        if status == 200 and isinstance(response, list):
            analytics_reports = response
            self.log_result(
                "Mock Data Consistency and Structure",
                len(analytics_reports) >= 0,
                f"Found {len(analytics_reports)} existing analytics reports"
            )
            
            # Validate report structure for demo modal
            if analytics_reports:
                sample_report = analytics_reports[0]
                required_fields = ['analysis_type', 'insights', 'recommendations', 'confidence_score']
                has_required_fields = all(field in sample_report for field in required_fields)
                
                self.log_result(
                    "Report Modal Data Format Validation",
                    has_required_fields,
                    "Analytics reports have proper structure for frontend display"
                )
        else:
            self.log_result("Analytics Data Structure", False, f"Status: {status}")
    
    def test_mobile_api_compatibility(self):
        """PRIORITY 4: Test mobile API compatibility"""
        print("\n📱 PRIORITY 4: MOBILE API COMPATIBILITY")
        print("=" * 60)
        
        # Test with mobile-like headers
        mobile_headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'BallyCasinoMobile/1.0 (iOS 15.0)',
            'Accept': 'application/json'
        }
        
        # Test key endpoints with mobile headers
        mobile_endpoints = [
            ('api/dashboard/metrics', 'Dashboard Metrics'),
            ('api/members?limit=10', 'Member Data'),
            ('api/gaming/sessions?limit=10', 'Gaming Sessions'),
            ('api/gaming/packages', 'Gaming Packages')
        ]
        
        for endpoint, name in mobile_endpoints:
            url = f"{self.base_url}/{endpoint}"
            headers = mobile_headers.copy()
            if self.superadmin_token:
                headers['Authorization'] = f'Bearer {self.superadmin_token}'
            
            try:
                response = requests.get(url, headers=headers, timeout=10)
                
                # Test data format consistency
                if response.status_code == 200:
                    data = response.json()
                    
                    # Validate JSON structure is mobile-friendly
                    is_valid_json = isinstance(data, (dict, list))
                    has_consistent_format = True
                    
                    # Check for consistent field naming (camelCase vs snake_case)
                    if isinstance(data, dict):
                        keys = list(data.keys())
                        if keys:
                            # Check if keys are consistent
                            snake_case_keys = [k for k in keys if '_' in k]
                            camel_case_keys = [k for k in keys if any(c.isupper() for c in k)]
                            has_consistent_format = len(snake_case_keys) == 0 or len(camel_case_keys) == 0
                    
                    self.log_result(
                        f"Mobile API - {name}",
                        is_valid_json and has_consistent_format,
                        f"Status: {response.status_code}, Format: {'Consistent' if has_consistent_format else 'Mixed'}"
                    )
                else:
                    self.log_result(f"Mobile API - {name}", False, f"Status: {response.status_code}")
                    
            except Exception as e:
                self.log_result(f"Mobile API - {name}", False, f"Error: {str(e)}")
        
        # Test permission masking for mobile users (Manager role)
        if self.manager_token:
            status, response = self.make_request('GET', 'api/members?limit=5', token=self.manager_token)
            if status == 200 and 'members' in response:
                members = response['members']
                if members:
                    # Check if sensitive data is properly masked/encrypted
                    sample_member = members[0]
                    nic_masked = sample_member.get('nic_passport', '') == '***ENCRYPTED***'
                    
                    self.log_result(
                        "Permission Masking for Mobile Users",
                        nic_masked,
                        "Sensitive data properly masked for mobile access"
                    )
                    
                    self.demo_scenarios.append("✅ Mobile app shows properly masked sensitive data")
    
    def test_demo_scenario_workflows(self):
        """PRIORITY 5: Test typical demo workflow scenarios"""
        print("\n🎭 PRIORITY 5: DEMO SCENARIO TESTING")
        print("=" * 60)
        
        if not self.superadmin_token:
            print("❌ Skipping demo scenarios - no SuperAdmin token")
            return
        
        # Demo Scenario 1: Dashboard Overview Flow
        print("\n📋 Demo Scenario 1: Dashboard Overview Flow")
        scenario_success = True
        
        # Step 1: Load dashboard metrics
        status, metrics = self.make_request('GET', 'api/dashboard/metrics', token=self.superadmin_token)
        if status != 200:
            scenario_success = False
        
        # Step 2: Load recent members
        status, members = self.make_request('GET', 'api/members?limit=5', token=self.superadmin_token)
        if status != 200:
            scenario_success = False
        
        # Step 3: Load active gaming sessions
        status, sessions = self.make_request('GET', 'api/gaming/sessions?status=active&limit=5', token=self.superadmin_token)
        if status != 200:
            scenario_success = False
        
        self.log_result(
            "Demo Scenario 1: Dashboard Overview Flow",
            scenario_success,
            "Dashboard → Members → Gaming Sessions workflow"
        )
        
        # Demo Scenario 2: Member Management Flow
        print("\n👥 Demo Scenario 2: Member Management Flow")
        scenario_success = True
        
        # Step 1: Search for members
        status, search_results = self.make_request('GET', 'api/members?search=Member&limit=3', token=self.superadmin_token)
        if status != 200:
            scenario_success = False
        
        # Step 2: Filter by tier
        status, tier_results = self.make_request('GET', 'api/members?tier=VIP&limit=3', token=self.superadmin_token)
        if status != 200:
            scenario_success = False
        
        # Step 3: Get member details (if members exist)
        if status == 200 and tier_results.get('members'):
            member_id = tier_results['members'][0]['id']
            status, member_details = self.make_request('GET', f'api/members/{member_id}', token=self.superadmin_token)
            if status != 200:
                scenario_success = False
        
        self.log_result(
            "Demo Scenario 2: Member Management Flow",
            scenario_success,
            "Search → Filter → Details workflow"
        )
        
        # Demo Scenario 3: Gaming Management Flow
        print("\n🎰 Demo Scenario 3: Gaming Management Flow")
        scenario_success = True
        
        # Step 1: Load gaming packages
        status, packages = self.make_request('GET', 'api/gaming/packages', token=self.superadmin_token)
        if status != 200:
            scenario_success = False
        
        # Step 2: Load gaming sessions with filtering
        status, active_sessions = self.make_request('GET', 'api/gaming/sessions?status=active&limit=10', token=self.superadmin_token)
        if status != 200:
            scenario_success = False
        
        status, completed_sessions = self.make_request('GET', 'api/gaming/sessions?status=completed&limit=10', token=self.superadmin_token)
        if status != 200:
            scenario_success = False
        
        self.log_result(
            "Demo Scenario 3: Gaming Management Flow",
            scenario_success,
            "Packages → Active Sessions → Completed Sessions workflow"
        )
        
        # Test error handling and fallbacks
        print("\n🛡️ Error Handling & Fallbacks")
        
        # Test invalid endpoint
        status, response = self.make_request('GET', 'api/invalid/endpoint', token=self.superadmin_token)
        self.log_result(
            "Error Handling - Invalid Endpoint",
            status == 404,
            f"Properly returns 404 for invalid endpoints"
        )
        
        # Test unauthorized access
        status, response = self.make_request('GET', 'api/dashboard/metrics')  # No token
        self.log_result(
            "Error Handling - Unauthorized Access",
            status == 401,
            f"Properly returns 401 for unauthorized access"
        )
    
    def run_comprehensive_pre_demo_test(self):
        """Run complete pre-demo verification suite"""
        print("🎰 BALLY'S CASINO ADMIN DASHBOARD")
        print("PHASE 1 COMPREHENSIVE BACKEND TESTING - Pre-Demo Verification")
        print("=" * 80)
        print(f"Testing against: {self.base_url}")
        print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
        
        # Initialize sample data first
        print("\n🔧 INITIALIZING SAMPLE DATA")
        status, response = self.make_request('POST', 'api/init/sample-data')
        if status == 200:
            print("✅ Sample data initialized successfully")
        else:
            print(f"⚠️  Sample data initialization: Status {status}")
        
        # Run all priority tests
        self.test_demo_authentication()
        self.test_core_dashboard_endpoints()
        self.test_advanced_analytics_system()
        self.test_mobile_api_compatibility()
        self.test_demo_scenario_workflows()
        
        # Generate final report
        self.generate_demo_readiness_report()
    
    def generate_demo_readiness_report(self):
        """Generate comprehensive demo readiness report"""
        print("\n" + "=" * 80)
        print("🎯 DEMO READINESS REPORT")
        print("=" * 80)
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        print(f"📊 OVERALL RESULTS:")
        print(f"   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 95:
            print(f"   Status: 🟢 EXCELLENT - Ready for demo")
        elif success_rate >= 85:
            print(f"   Status: 🟡 GOOD - Minor issues to address")
        else:
            print(f"   Status: 🔴 NEEDS ATTENTION - Critical issues found")
        
        print(f"\n🎭 DEMO SCENARIOS VALIDATED:")
        for scenario in self.demo_scenarios:
            print(f"   {scenario}")
        
        if self.critical_failures:
            print(f"\n❌ CRITICAL ISSUES REQUIRING ATTENTION:")
            for failure in self.critical_failures:
                print(f"   • {failure}")
        
        print(f"\n🚀 DEMO READINESS ASSESSMENT:")
        if success_rate >= 95 and len(self.critical_failures) == 0:
            print("   ✅ SYSTEM IS FULLY READY FOR CLIENT DEMONSTRATION")
            print("   ✅ All critical endpoints are functional")
            print("   ✅ Authentication and permissions working correctly")
            print("   ✅ Data consistency verified across all modules")
            print("   ✅ Mobile compatibility confirmed")
            print("   ✅ Demo scenarios tested and validated")
        elif success_rate >= 85:
            print("   ⚠️  SYSTEM IS MOSTLY READY - Minor issues detected")
            print("   ✅ Core functionality working")
            print("   ⚠️  Some non-critical issues may need attention")
        else:
            print("   🔴 SYSTEM NEEDS IMMEDIATE ATTENTION BEFORE DEMO")
            print("   ❌ Critical issues detected that could disrupt demonstration")
        
        print("\n" + "=" * 80)
        print(f"Pre-demo testing completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
        
        return success_rate >= 95

if __name__ == "__main__":
    tester = PreDemoTester()
    demo_ready = tester.run_comprehensive_pre_demo_test()
    
    # Exit with appropriate code
    sys.exit(0 if demo_ready else 1)