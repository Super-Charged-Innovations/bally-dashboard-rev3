const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class ApiService {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
    
    // TEMPORARY: Handle mock token by returning sample data for key endpoints
    if (token === 'temp-mock-token') {
      return this.getMockData(endpoint);
    }
    
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Enhanced error handling
      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.reload();
        return;
      }

      if (response.status === 403) {
        throw new Error('Access denied. You don\'t have permission for this action.');
      }

      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment before trying again.');
      }

      if (response.status === 500) {
        throw new Error('Server error. Please try again later or contact support.');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          detail: `Request failed with status ${response.status}` 
        }));
        throw new Error(error.detail || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Enhanced error logging and user feedback
      console.error(`API request failed: ${endpoint}`, error);
      
      // Provide user-friendly error messages
      const userFriendlyMessage = this.getUserFriendlyErrorMessage(error, endpoint);
      throw new Error(userFriendlyMessage);
    }
  }

  getUserFriendlyErrorMessage(error, endpoint) {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Network connection problem. Please check your internet connection.';
    }

    // Rate limiting
    if (error.message.includes('Too many requests')) {
      return 'Too many attempts. Please wait a minute before trying again.';
    }

    // Permission errors
    if (error.message.includes('Access denied') || error.message.includes('Insufficient permissions')) {
      return 'You don\'t have permission to perform this action.';
    }

    // Authentication errors
    if (error.message.includes('Invalid username or password')) {
      return 'Invalid login credentials. Please check your username and password.';
    }

    // Server errors
    if (error.message.includes('Server error') || error.message.includes('500')) {
      return 'Server temporarily unavailable. Please try again in a few moments.';
    }

    // Validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return 'Please check your input and try again.';
    }

    // Default message
    return error.message || 'An unexpected error occurred. Please try again.';
  }

  // Dashboard endpoints
  async getDashboardMetrics() {
    return this.request('/api/dashboard/metrics');
  }

  // Member management endpoints
  async getMembers(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    
    const query = searchParams.toString();
    return this.request(`/api/members${query ? `?${query}` : ''}`);
  }

  async getMember(memberId) {
    return this.request(`/api/members/${memberId}`);
  }

  async updateMember(memberId, memberData) {
    return this.request(`/api/members/${memberId}`, {
      method: 'PUT',
      body: memberData,
    });
  }

  async updateMemberTier(memberId, newTier, reason) {
    return this.request(`/api/members/${memberId}/tier`, {
      method: 'PATCH',
      body: { tier: newTier, reason },
    });
  }

  // Gaming management endpoints
  async getGamingSessions(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    
    const query = searchParams.toString();
    return this.request(`/api/gaming/sessions${query ? `?${query}` : ''}`);
  }

  async getGamingPackages() {
    return this.request('/api/gaming/packages');
  }

  async createGamingPackage(packageData) {
    return this.request('/api/gaming/packages', {
      method: 'POST',
      body: packageData,
    });
  }

  async updateGamingPackage(packageId, packageData) {
    return this.request(`/api/gaming/packages/${packageId}`, {
      method: 'PUT',
      body: packageData,
    });
  }

  // Rewards management endpoints
  async getRewards() {
    return this.request('/api/rewards');
  }

  async createReward(rewardData) {
    return this.request('/api/rewards', {
      method: 'POST',
      body: rewardData,
    });
  }

  async updateReward(rewardId, rewardData) {
    return this.request(`/api/rewards/${rewardId}`, {
      method: 'PUT',
      body: rewardData,
    });
  }

  async deleteReward(rewardId) {
    return this.request(`/api/rewards/${rewardId}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getAnalyticsData(type, params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    
    const query = searchParams.toString();
    return this.request(`/api/analytics/${type}${query ? `?${query}` : ''}`);
  }

  // Initialize sample data (for testing)
  async initializeSampleData() {
    return this.request('/api/init/sample-data', {
      method: 'POST',
    });
  }

  // Phase 2: Marketing Intelligence APIs
  async getMarketingDashboard() {
    return this.request('/api/marketing/dashboard');
  }

  async getBirthdayCalendar(month = null) {
    const params = month ? `?month=${month}` : '';
    return this.request(`/api/marketing/birthday-calendar${params}`);
  }

  async getInactiveCustomers(days = 30) {
    return this.request(`/api/marketing/inactive-customers?days=${days}`);
  }

  async getWalkInGuests(date = null) {
    const params = date ? `?date=${date}` : '';
    return this.request(`/api/marketing/walk-in-guests${params}`);
  }

  async getMarketingCampaigns(status = null, campaignType = null) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (campaignType) params.append('campaign_type', campaignType);
    const query = params.toString();
    return this.request(`/api/marketing/campaigns${query ? `?${query}` : ''}`);
  }

  async createMarketingCampaign(campaignData) {
    return this.request('/api/marketing/campaigns', {
      method: 'POST',
      body: campaignData,
    });
  }

  // Phase 2: Travel & VIP Management APIs
  async getVIPTravelDashboard() {
    return this.request('/api/travel/vip-dashboard');
  }

  async getVIPExperiences(status = null) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/api/travel/vip-experiences${params}`);
  }

  async createVIPExperience(experienceData) {
    return this.request('/api/travel/vip-experiences', {
      method: 'POST',
      body: experienceData,
    });
  }

  async getGroupBookings(status = null) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/api/travel/group-bookings${params}`);
  }

  async createGroupBooking(bookingData) {
    return this.request('/api/travel/group-bookings', {
      method: 'POST',
      body: bookingData,
    });
  }

  // Phase 3: Staff Management & Advanced Analytics APIs
  async getStaffDashboard() {
    return this.request('/api/staff/dashboard');
  }

  async getStaffMembers(department = null, search = null) {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (search) params.append('search', search);
    const query = params.toString();
    return this.request(`/api/staff/members${query ? `?${query}` : ''}`);
  }

  async getTrainingCourses(category = null) {
    const params = category ? `?category=${category}` : '';
    return this.request(`/api/staff/training/courses${params}`);
  }

  async createTrainingCourse(courseData) {
    return this.request('/api/staff/training/courses', {
      method: 'POST',
      body: courseData,
    });
  }

  async getTrainingRecords(staffId = null, courseId = null, status = null) {
    const params = new URLSearchParams();
    if (staffId) params.append('staff_id', staffId);
    if (courseId) params.append('course_id', courseId);
    if (status) params.append('status', status);
    const query = params.toString();
    return this.request(`/api/staff/training/records${query ? `?${query}` : ''}`);
  }

  async createPerformanceReview(reviewData) {
    return this.request('/api/staff/performance/reviews', {
      method: 'POST',
      body: reviewData,
    });
  }

  async getAdvancedAnalytics(analysisType = null, timePeriod = null) {
    const params = new URLSearchParams();
    if (analysisType) params.append('analysis_type', analysisType);
    if (timePeriod) params.append('time_period', timePeriod);
    const query = params.toString();
    return this.request(`/api/analytics/advanced${query ? `?${query}` : ''}`);
  }

  async generateAnalyticsReport(analysisType, timePeriod = 'monthly') {
    return this.request('/api/analytics/generate', {
      method: 'POST',
      body: { analysis_type: analysisType, time_period: timePeriod },
    });
  }

  async getCostOptimization(area = null, status = null) {
    const params = new URLSearchParams();
    if (area) params.append('area', area);
    if (status) params.append('status', status);
    const query = params.toString();
    return this.request(`/api/optimization/cost-savings${query ? `?${query}` : ''}`);
  }

  async createCostOptimization(optimizationData) {
    return this.request('/api/optimization/opportunities', {
      method: 'POST',
      body: optimizationData,
    });
  }

  async getPredictiveModels(modelType = null, isProduction = null) {
    const params = new URLSearchParams();
    if (modelType) params.append('model_type', modelType);
    if (isProduction !== null) params.append('is_production', isProduction);
    const query = params.toString();
    return this.request(`/api/predictive/models${query ? `?${query}` : ''}`);
  }

  async createPredictiveModel(modelData) {
    return this.request('/api/predictive/models', {
      method: 'POST',
      body: modelData,
    });
  }

  // Phase 4 - Enterprise Features APIs
  // Notifications
  async getNotifications(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    const query = searchParams.toString();
    return this.request(`/api/notifications${query ? `?${query}` : ''}`);
  }

  async createNotification(data) {
    return this.request('/api/notifications', {
      method: 'POST',
      body: data,
    });
  }

  async markNotificationRead(id) {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async getNotificationTemplates(category = null) {
    const params = category ? `?category=${category}` : '';
    return this.request(`/api/notifications/templates${params}`);
  }

  async createNotificationTemplate(data) {
    return this.request('/api/notifications/templates', {
      method: 'POST',
      body: data,
    });
  }

  // Compliance & Audit
  async getComplianceReports(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    const query = searchParams.toString();
    return this.request(`/api/compliance/reports${query ? `?${query}` : ''}`);
  }

  async generateComplianceReport(data) {
    return this.request('/api/compliance/reports/generate', {
      method: 'POST',
      body: data,
    });
  }

  async getEnhancedAuditLogs(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    const query = searchParams.toString();
    return this.request(`/api/audit/enhanced${query ? `?${query}` : ''}`);
  }

  // System Integrations
  async getSystemIntegrations(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    const query = searchParams.toString();
    return this.request(`/api/integrations${query ? `?${query}` : ''}`);
  }

  async createSystemIntegration(data) {
    return this.request('/api/integrations', {
      method: 'POST',
      body: data,
    });
  }

  async syncIntegration(id) {
    return this.request(`/api/integrations/${id}/sync`, {
      method: 'PATCH',
    });
  }

  // Enhanced User Analytics
  async getUserActivityAnalytics(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    const query = searchParams.toString();
    return this.request(`/api/analytics/user-activity${query ? `?${query}` : ''}`);
  }

  async getRealTimeEvents(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    const query = searchParams.toString();
    return this.request(`/api/analytics/real-time-events${query ? `?${query}` : ''}`);
  }

  async createRealTimeEvent(data) {
    return this.request('/api/analytics/real-time-events', {
      method: 'POST',
      body: data,
    });
  }

  // Data Retention
  async getDataRetentionPolicies(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    const query = searchParams.toString();
    return this.request(`/api/data-retention/policies${query ? `?${query}` : ''}`);
  }

  async createDataRetentionPolicy(data) {
    return this.request('/api/data-retention/policies', {
      method: 'POST',
      body: data,
    });
  }

  // Basic HTTP methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { method: 'POST', body: data, ...options });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { method: 'PUT', body: data, ...options });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, { method: 'PATCH', body: data, ...options });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }

  // TEMPORARY: Mock data for bypass mode
  getMockData(endpoint) {
    // Dashboard metrics
    if (endpoint === '/api/dashboard/metrics') {
      return Promise.resolve({
        total_members: 250,
        members_by_tier: { "Ruby": 75, "Sapphire": 100, "Diamond": 60, "VIP": 15 },
        active_sessions: 125,
        daily_revenue: 45750,
        weekly_revenue: 325000,
        monthly_revenue: 1450000,
        top_games: [
          { name: "Blackjack", sessions: 45 },
          { name: "Roulette", sessions: 38 },
          { name: "Poker", sessions: 32 }
        ],
        recent_registrations: 8
      });
    }

    // Members data
    if (endpoint.startsWith('/api/members')) {
      return Promise.resolve({
        members: [
          {
            id: "1",
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@example.com",
            phone: "+94701234567",
            tier: "Diamond",
            points_balance: 2500,
            total_spent: 15000,
            is_active: true,
            registration_date: "2024-01-15"
          },
          {
            id: "2", 
            first_name: "Jane",
            last_name: "Smith",
            email: "jane.smith@example.com",
            phone: "+94709876543",
            tier: "VIP",
            points_balance: 5500,
            total_spent: 45000,
            is_active: true,
            registration_date: "2023-08-22"
          },
          {
            id: "3", 
            first_name: "David",
            last_name: "Wilson",
            email: "david.wilson@example.com",
            phone: "+94701111111",
            tier: "Ruby",
            points_balance: 850,
            total_spent: 5200,
            is_active: true,
            registration_date: "2024-03-10"
          }
        ],
        total: 250,
        page: 1,
        pages: 84
      });
    }

    // Gaming sessions
    if (endpoint.startsWith('/api/gaming/sessions')) {
      return Promise.resolve({
        sessions: [
          {
            id: "sess-1",
            member_id: "1",
            game_type: "Blackjack",
            table_number: "BJ-01",
            start_time: "2025-01-09T10:00:00Z",
            end_time: "2025-01-09T12:30:00Z",
            status: "completed",
            total_bet: 5000,
            total_win: 5750,
            points_earned: 50,
            member_name: "John Doe"
          },
          {
            id: "sess-2",
            member_id: "2",
            game_type: "Roulette",
            table_number: "RT-03",
            start_time: "2025-01-09T14:00:00Z",
            end_time: "2025-01-09T16:45:00Z",
            status: "completed",
            total_bet: 12000,
            total_win: 18500,
            points_earned: 120,
            member_name: "Jane Smith"
          }
        ],
        total: 125,
        page: 1,
        pages: 42
      });
    }

    // Gaming packages
    if (endpoint.startsWith('/api/gaming/packages')) {
      return Promise.resolve([
        {
          id: "pkg-1",
          name: "VIP Experience",
          description: "Premium gaming package with exclusive perks",
          price: 25000,
          credits: 30000,
          validity_hours: 6,
          duration: "4 hours",
          is_active: true,
          tier_access: ["Sapphire", "Diamond", "VIP"],
          services: ["Private Table", "Premium Drinks", "Dedicated Host"]
        },
        {
          id: "pkg-2",
          name: "High Roller",
          description: "Elite gaming package for serious players",
          price: 50000,
          credits: 65000,
          validity_hours: 12,
          duration: "8 hours",
          is_active: true,
          tier_access: ["Diamond", "VIP"],
          services: ["VIP Room", "Premium Service", "Luxury Transportation"]
        },
        {
          id: "pkg-3",
          name: "Ruby Starter",
          description: "Entry-level gaming package for new members",
          price: 10000,
          credits: 12000,
          validity_hours: 3,
          duration: "2 hours",
          is_active: true,
          tier_access: ["Ruby", "Sapphire", "Diamond", "VIP"],
          services: ["Gaming Credits", "Welcome Drink", "Basic Support"]
        },
        {
          id: "pkg-4",
          name: "Weekend Special",
          description: "Weekend exclusive package with bonus credits",
          price: 35000,
          credits: 42000,
          validity_hours: 8,
          duration: "6 hours",
          is_active: false,
          tier_access: ["Sapphire", "Diamond", "VIP"],
          services: ["Weekend Bonus", "Premium Drinks", "Late Night Gaming"]
        }
      ]);
    }

    // Rewards data
    if (endpoint.startsWith('/api/rewards')) {
      return Promise.resolve([
        {
          id: "reward-1",
          name: "Welcome Bonus Points",
          description: "New member welcome bonus to get started",
          category: "gaming",
          points_required: 0,
          cash_value: 25.00,
          stock_quantity: null,
          is_active: true,
          tier_access: ["Ruby", "Sapphire", "Diamond", "VIP"],
          requirements: "First visit"
        },
        {
          id: "reward-2",
          name: "VIP Dining Voucher",
          description: "Complimentary dining at premium restaurants",
          category: "dining",
          points_required: 2500,
          cash_value: 100.00,
          stock_quantity: 50,
          is_active: true,
          tier_access: ["Diamond", "VIP"],
          requirements: "Diamond tier or above"
        },
        {
          id: "reward-3",
          name: "Luxury Suite Upgrade",
          description: "One night luxury suite accommodation upgrade",
          category: "accommodation",
          points_required: 5000,
          cash_value: 300.00,
          stock_quantity: 10,
          is_active: true,
          tier_access: ["VIP"],
          requirements: "VIP tier membership"
        },
        {
          id: "reward-4",
          name: "Casino Branded Watch",
          description: "Exclusive Bally's branded luxury timepiece",
          category: "merchandise",
          points_required: 7500,
          cash_value: 450.00,
          stock_quantity: 25,
          is_active: true,
          tier_access: ["Sapphire", "Diamond", "VIP"],
          requirements: "Minimum 6 months membership"
        },
        {
          id: "reward-5",
          name: "High Roller Bonus",
          description: "Special gaming bonus for high-value players",
          category: "gaming",
          points_required: 10000,
          cash_value: 1000.00,
          stock_quantity: null,
          is_active: true,
          tier_access: ["VIP"],
          requirements: "VIP tier and minimum $50K lifetime spend"
        },
        {
          id: "reward-6",
          name: "Weekend Getaway Package",
          description: "Two nights accommodation with dining credits",
          category: "accommodation",
          points_required: 15000,
          cash_value: 800.00,
          stock_quantity: 5,
          is_active: false,
          tier_access: ["Diamond", "VIP"],
          requirements: "Currently unavailable - seasonal offer"
        }
      ]);
    }

    // Analytics data
    if (endpoint.startsWith('/api/analytics')) {
      return Promise.resolve({
        revenue_trend: [
          { date: "2025-01-01", amount: 125000 },
          { date: "2025-01-02", amount: 143000 },
          { date: "2025-01-03", amount: 156000 },
          { date: "2025-01-04", amount: 134000 },
          { date: "2025-01-05", amount: 167000 }
        ],
        member_acquisition: [
          { month: "Nov", count: 45 },
          { month: "Dec", count: 62 },
          { month: "Jan", count: 58 }
        ],
        game_popularity: [
          { game: "Blackjack", sessions: 856 },
          { game: "Roulette", sessions: 743 },
          { game: "Poker", sessions: 612 },
          { game: "Slots", sessions: 987 }
        ]
      });
    }

    // Marketing data
    if (endpoint.startsWith('/api/marketing')) {
      return Promise.resolve({
        campaigns: [
          {
            id: "camp-1",
            name: "New Year Promotion",
            status: "active",
            target_audience: "All Members",
            start_date: "2025-01-01",
            end_date: "2025-01-31",
            budget: 50000,
            performance: { reach: 1250, conversions: 156 }
          }
        ],
        birthday_members: [
          { id: "1", member_name: "Alice Johnson", tier: "VIP", birthday_date: "2025-01-15" }
        ],
        inactive_members: [
          { id: "2", member_name: "Bob Wilson", tier: "Ruby", last_visit: "2024-11-20" }
        ]
      });
    }

    // Staff Management APIs
    if (endpoint.includes('/api/staff/dashboard')) {
      return Promise.resolve({
        total_staff: 143,
        active_employees: 143,
        staff_by_department: {
          Gaming: 45,
          Security: 25,
          "F&B": 38,
          Management: 15,
          Maintenance: 20
        },
        training_completion_rate: 78.5,
        average_performance_score: 4.2,
        recent_training_enrollments: 12,
        reviews_due_count: 8,
        training_stats: {
          total_courses: 15,
          total_enrollments: 285,
          completed_this_month: 45,
          completion_rate: 78.5
        }
      });
    }

    if (endpoint.includes('/api/staff/members')) {
      const staffMembers = [
        {
          id: "staff-001",
          employee_id: "EMP001",
          first_name: "Maria",
          last_name: "Rodriguez",
          department: "Gaming",
          position: "Senior Dealer",
          hire_date: "2022-03-15",
          performance_score: 92,
          training_completion_rate: 95,
          employment_status: "active",
          skills: ["Blackjack", "Poker", "Customer Service", "Cash Handling", "Problem Solving"],
          email: "maria.rodriguez@ballyscasino.lk"
        },
        {
          id: "staff-002", 
          employee_id: "EMP002",
          first_name: "James",
          last_name: "Chen",
          department: "Security",
          position: "Security Supervisor",
          hire_date: "2021-08-20",
          performance_score: 88,
          training_completion_rate: 100,
          employment_status: "active",
          skills: ["Surveillance", "Crowd Control", "Emergency Response", "Report Writing"],
          email: "james.chen@ballyscasino.lk"
        },
        {
          id: "staff-003",
          employee_id: "EMP003", 
          first_name: "Sarah",
          last_name: "Johnson",
          department: "F&B",
          position: "Restaurant Manager",
          hire_date: "2020-11-10",
          performance_score: 95,
          training_completion_rate: 92,
          employment_status: "active",
          skills: ["Food Service", "Inventory Management", "Staff Training", "Customer Relations"],
          email: "sarah.johnson@ballyscasino.lk"
        },
        {
          id: "staff-004",
          employee_id: "EMP004",
          first_name: "Michael",
          last_name: "Patel",
          department: "Management",
          position: "Floor Manager",
          hire_date: "2019-05-14",
          performance_score: 89,
          training_completion_rate: 88,
          employment_status: "active",
          skills: ["Leadership", "Operations Management", "Staff Supervision", "Customer Service"],
          email: "michael.patel@ballyscasino.lk"
        },
        {
          id: "staff-005",
          employee_id: "EMP005",
          first_name: "Lisa",
          last_name: "Wang",
          department: "Gaming",
          position: "Pit Boss",
          hire_date: "2021-01-22",
          performance_score: 91,
          training_completion_rate: 96,
          employment_status: "active",
          skills: ["Game Supervision", "Dealer Management", "Risk Assessment", "Customer Relations"],
          email: "lisa.wang@ballyscasino.lk"
        },
        {
          id: "staff-006",
          employee_id: "EMP006",
          first_name: "David",
          last_name: "Kumar",
          department: "Maintenance",
          position: "Technical Specialist",
          hire_date: "2022-09-08",
          performance_score: 85,
          training_completion_rate: 82,
          employment_status: "active",
          skills: ["Equipment Repair", "Preventive Maintenance", "Electrical Systems", "HVAC"],
          email: "david.kumar@ballyscasino.lk"
        }
      ];
      
      return Promise.resolve({
        staff_members: staffMembers,
        total_staff: 143,
        filtered_count: staffMembers.length
      });
    }

    if (endpoint.includes('/api/staff/training/courses')) {
      const trainingCourses = [
        {
          id: "course-001",
          course_name: "Responsible Gaming Certification",
          description: "Comprehensive training on responsible gaming practices, problem gambling identification, and customer intervention techniques.",
          category: "Compliance",
          duration_hours: 8,
          difficulty_level: "intermediate",
          passing_score: 80,
          is_mandatory: true,
          is_active: true,
          required_for_positions: ["Dealer", "Pit Boss", "Floor Manager"],
          created_date: "2024-01-15"
        },
        {
          id: "course-002",
          course_name: "Anti-Money Laundering (AML) Training",
          description: "Training on AML regulations, suspicious transaction identification, and reporting requirements for casino operations.",
          category: "Compliance",
          duration_hours: 6,
          difficulty_level: "intermediate", 
          passing_score: 85,
          is_mandatory: true,
          is_active: true,
          required_for_positions: ["All Positions"],
          created_date: "2024-01-10"
        },
        {
          id: "course-003",
          course_name: "Customer Service Excellence",
          description: "Advanced customer service techniques, conflict resolution, and VIP guest management for luxury gaming environments.",
          category: "Customer Service",
          duration_hours: 4,
          difficulty_level: "beginner",
          passing_score: 75,
          is_mandatory: false,
          is_active: true,
          required_for_positions: ["Dealer", "Host", "Manager"],
          created_date: "2024-02-01"
        },
        {
          id: "course-004",
          course_name: "Security Protocols & Emergency Response",
          description: "Comprehensive security training covering threat assessment, emergency procedures, and incident response protocols.",
          category: "Security",
          duration_hours: 12,
          difficulty_level: "advanced",
          passing_score: 90,
          is_mandatory: true,
          is_active: true,
          required_for_positions: ["Security Officer", "Security Supervisor"],
          created_date: "2024-01-20"
        }
      ];
      
      return Promise.resolve(trainingCourses);
    }

    if (endpoint.includes('/api/staff/training/records')) {
      const trainingRecords = [
        {
          id: "record-001",
          staff_id: "staff-001",
          staff_name: "Maria Rodriguez",
          course_id: "course-001", 
          course_name: "Responsible Gaming Certification",
          enrollment_date: "2024-01-20",
          completion_date: "2024-01-25",
          status: "completed",
          score: 92,
          time_spent_minutes: 480,
          attempts: 1
        },
        {
          id: "record-002",
          staff_id: "staff-001",
          staff_name: "Maria Rodriguez", 
          course_id: "course-002",
          course_name: "Anti-Money Laundering (AML) Training",
          enrollment_date: "2024-02-01",
          completion_date: "2024-02-03",
          status: "completed",
          score: 88,
          time_spent_minutes: 360,
          attempts: 1
        },
        {
          id: "record-003",
          staff_id: "staff-002",
          staff_name: "James Chen",
          course_id: "course-004",
          course_name: "Security Protocols & Emergency Response", 
          enrollment_date: "2024-01-15",
          completion_date: "2024-01-20",
          status: "completed",
          score: 95,
          time_spent_minutes: 720,
          attempts: 1
        },
        {
          id: "record-004",
          staff_id: "staff-003",
          staff_name: "Sarah Johnson",
          course_id: "course-003",
          course_name: "Customer Service Excellence",
          enrollment_date: "2024-02-10",
          completion_date: null,
          status: "in_progress", 
          score: null,
          time_spent_minutes: 180,
          attempts: 0
        },
        {
          id: "record-005",
          staff_id: "staff-004", 
          staff_name: "Michael Patel",
          course_id: "course-001",
          course_name: "Responsible Gaming Certification",
          enrollment_date: "2024-02-05",
          completion_date: null,
          status: "enrolled",
          score: null,
          time_spent_minutes: 60,
          attempts: 0
        },
        {
          id: "record-006",
          staff_id: "staff-005",
          staff_name: "Lisa Wang", 
          course_id: "course-002",
          course_name: "Anti-Money Laundering (AML) Training",
          enrollment_date: "2024-01-25",
          completion_date: "2024-01-30",
          status: "completed",
          score: 91,
          time_spent_minutes: 380,
          attempts: 1
        }
      ];
      
      return Promise.resolve({
        training_records: trainingRecords,
        total_records: trainingRecords.length
      });
    }

    // Notifications
    if (endpoint.startsWith('/api/notifications/templates')) {
      return Promise.resolve([
        {
          id: "template-1",
          name: "High-Value Transaction Alert Template",
          title: "High-Value Transaction Alert",
          content: "A high-value transaction of ${amount} has been placed by ${member_name} (${tier} member)",
          category: "security",
          priority: "high",
          channels: ['in_app', 'email', 'sms'],
          variables: ['amount', 'member_name', 'tier'],
          is_active: true,
          created_at: "2025-01-01T10:00:00Z"
        },
        {
          id: "template-2",
          name: "Staff Training Reminder",
          title: "Training Due Reminder",
          content: "You have ${course_count} mandatory training course(s) due by ${due_date}. Please complete them to maintain compliance.",
          category: "system",
          priority: "normal",
          channels: ['in_app', 'email'],
          variables: ['course_count', 'due_date'],
          is_active: true,
          created_at: "2025-01-01T10:00:00Z"
        },
        {
          id: "template-3",
          name: "VIP Welcome Message",
          title: "Welcome to VIP Status",
          content: "Congratulations ${member_name}! You have been upgraded to ${tier} status. Enjoy exclusive benefits and privileges.",
          category: "marketing",
          priority: "normal",
          channels: ['in_app', 'email'],
          variables: ['member_name', 'tier'],
          is_active: true,
          created_at: "2025-01-01T10:00:00Z"
        },
        {
          id: "template-4",
          name: "Compliance Violation Alert",
          title: "Compliance Issue Detected",
          content: "A ${severity} compliance issue has been detected in ${area}. Immediate attention required: ${description}",
          category: "compliance",
          priority: "critical",
          channels: ['in_app', 'email', 'sms'],
          variables: ['severity', 'area', 'description'],
          is_active: true,
          created_at: "2025-01-01T10:00:00Z"
        },
        {
          id: "template-5",
          name: "System Maintenance Notice",
          title: "Scheduled System Maintenance",
          content: "System maintenance is scheduled for ${date} from ${start_time} to ${end_time}. Some services may be unavailable during this period.",
          category: "system",
          priority: "normal",
          channels: ['in_app', 'email'],
          variables: ['date', 'start_time', 'end_time'],
          is_active: false,
          created_at: "2025-01-01T10:00:00Z"
        }
      ]);
    }

    if (endpoint.startsWith('/api/notifications')) {
      return Promise.resolve({
        notifications: [
          {
            id: "notif-1",
            title: "High-Value Transaction Alert",
            content: "VIP member Jane Smith has placed a $50,000 bet at Table VIP-01. Transaction ID: TX-2025-001",
            category: "security",
            priority: "high",
            status: "unread",
            recipient_type: "admin",
            channels: ['in_app', 'email'],
            created_at: "2025-01-09T15:30:00Z"
          },
          {
            id: "notif-2",
            title: "Staff Training Due",
            content: "5 staff members have mandatory training due this week. Departments affected: Gaming (3), Security (2).",
            category: "system",
            priority: "normal",
            status: "unread",
            recipient_type: "manager",
            channels: ['in_app'],
            created_at: "2025-01-09T09:15:00Z"
          },
          {
            id: "notif-3",
            title: "New VIP Member Registration",
            content: "David Chen has been upgraded to VIP status. Lifetime spend: $125,000. Welcome package sent.",
            category: "marketing",
            priority: "normal",
            status: "read",
            recipient_type: "admin",
            channels: ['in_app', 'email'],
            created_at: "2025-01-09T08:45:00Z"
          },
          {
            id: "notif-4",
            title: "Compliance Report Generated",
            content: "Monthly PDPA compliance report has been generated successfully. 2 minor issues identified and resolved.",
            category: "compliance",
            priority: "normal",
            status: "delivered",
            recipient_type: "compliance_officer",
            channels: ['in_app', 'email'],
            created_at: "2025-01-09T07:00:00Z"
          },
          {
            id: "notif-5",
            title: "System Performance Alert",
            content: "Database query response time has increased by 15% in the last hour. Auto-optimization triggered.",
            category: "system",
            priority: "high",
            status: "sent",
            recipient_type: "admin",
            channels: ['in_app', 'sms'],
            created_at: "2025-01-09T14:20:00Z"
          },
          {
            id: "notif-6",
            title: "Security Login Attempt",
            content: "Multiple failed login attempts detected from IP 192.168.1.50. Account temporarily locked for security.",
            category: "security",
            priority: "critical",
            status: "delivered",
            recipient_type: "security_team",
            channels: ['in_app', 'email', 'sms'],
            created_at: "2025-01-09T13:10:00Z"
          },
          {
            id: "notif-7",
            title: "Birthday Campaign Reminder",
            content: "15 VIP members have birthdays this week. Birthday bonus campaigns are ready to be activated.",
            category: "marketing",
            priority: "low",
            status: "pending",
            recipient_type: "marketing_team",
            channels: ['in_app'],
            created_at: "2025-01-09T06:30:00Z"
          },
          {
            id: "notif-8",
            title: "Inventory Stock Alert",
            content: "Luxury Suite Upgrade rewards are running low (3 remaining). Consider restocking or pausing the offer.",
            category: "system",
            priority: "normal",
            status: "read",
            recipient_type: "manager",
            channels: ['in_app', 'email'],
            created_at: "2025-01-08T16:45:00Z"
          }
        ],
        total: 24,
        page: 1,
        pages: 3
      });
    }

    // Security endpoints
    if (endpoint.startsWith('/api/security/alerts')) {
      return Promise.resolve([
        {
          id: "alert-1",
          title: "Suspicious Activity Detected - High Roller Area",
          description: "Multiple large cash transactions detected from unverified guest. Pattern analysis suggests potential money laundering activity.",
          severity: "critical",
          status: "active",
          location: "VIP Gaming Floor - Table 7",
          timestamp: "2025-01-11T14:30:00Z",
          recommendations: [
            "Immediately alert security personnel on VIP floor",
            "Initiate discrete surveillance protocol",
            "Prepare AML documentation for regulatory reporting"
          ]
        },
        {
          id: "alert-2", 
          title: "Unauthorized Access Attempt - Staff Area",
          description: "Failed keycard access attempts detected at secured staff entrance. Security footage shows unidentified individual.",
          severity: "high",
          status: "investigating",
          location: "Staff Entrance B - Floor 2",
          timestamp: "2025-01-11T13:15:00Z",
          recommendations: [
            "Secure staff entrance immediately",
            "Review CCTV footage with security team",
            "Notify all staff of security protocol"
          ]
        },
        {
          id: "alert-3",
          title: "Equipment Tampering - Slot Machine Area",
          description: "Physical inspection revealed signs of tampering on Slot Bank C. Device integrity compromised.",
          severity: "high", 
          status: "resolved",
          location: "Main Gaming Floor - Slot Bank C",
          timestamp: "2025-01-11T11:45:00Z",
          recommendations: [
            "Machine taken offline for forensic analysis",
            "Enhanced monitoring of surrounding machines",
            "Staff briefing on tampering indicators"
          ]
        },
        {
          id: "alert-4",
          title: "Network Security Breach Attempt",
          description: "Firewall detected attempted intrusion from external IP. Multiple failed authentication attempts on gaming systems.",
          severity: "medium",
          status: "resolved",
          location: "IT Infrastructure - Network Layer",
          timestamp: "2025-01-11T09:20:00Z",
          recommendations: [
            "IP address blocked and reported to authorities",
            "Security patches applied to vulnerable systems",
            "Increased monitoring of network traffic"
          ]
        },
        {
          id: "alert-5",
          title: "Customer Behavioral Anomaly",
          description: "Guest exhibiting erratic behavior and making threats toward staff. Security intervention requested.",
          severity: "medium",
          status: "active",
          location: "Main Bar Area",
          timestamp: "2025-01-11T16:10:00Z",
          recommendations: [
            "Security personnel dispatched to location",
            "Manager notified for guest service intervention",
            "Prepare incident report for legal compliance"
          ]
        }
      ]);
    }

    if (endpoint.startsWith('/api/security/briefs')) {
      return Promise.resolve([
        {
          id: "brief-1",
          title: "Daily Security Briefing - January 11, 2025",
          description: "Comprehensive overview of security status, incidents, and operational protocols for the day shift.",
          date: "2025-01-11T07:00:00Z",
          author: "Marcus Johnson, Head of Security",
          severity: "medium",
          content: "Current threat level: MODERATE. Three active investigations ongoing. VIP gaming area requires enhanced surveillance. New staff security training scheduled for next week."
        },
        {
          id: "brief-2",
          title: "Weekly Security Assessment Report",
          description: "Analysis of security incidents, trends, and preventive measures implemented during the past week.",
          date: "2025-01-10T09:00:00Z",
          author: "Sarah Chen, Security Analyst", 
          severity: "low",
          content: "Overall security posture improved by 15% this week. Key achievements include successful deployment of new surveillance system and completion of staff emergency drills."
        },
        {
          id: "brief-3",
          title: "Regulatory Compliance Update",
          description: "Updates on compliance requirements, upcoming audits, and necessary security adjustments.",
          date: "2025-01-09T14:30:00Z",
          author: "David Rodriguez, Compliance Officer",
          severity: "high",
          content: "New Sri Lankan gaming regulations effective February 1st. Security protocols must be updated to meet enhanced customer identification requirements."
        },
        {
          id: "brief-4",
          title: "Emergency Response Protocol Review",
          description: "Quarterly review of emergency response procedures and security team performance metrics.",
          date: "2025-01-08T11:00:00Z",
          author: "Lisa Thompson, Security Training Coordinator",
          severity: "medium",
          content: "Emergency response times improved by 23% this quarter. All security personnel completed updated crisis management training."
        }
      ]);
    }

    if (endpoint.startsWith('/api/security/advisories')) {
      return Promise.resolve([
        {
          id: "advisory-1",
          title: "Enhanced Surveillance During Peak Hours",
          description: "Intelligence suggests increased risk of organized fraud attempts during weekend peak hours. Heightened vigilance recommended.",
          severity: "high",
          date: "2025-01-11T08:00:00Z",
          author: "Intelligence Unit",
          recommendations: [
            "Increase surveillance personnel by 30% during peak hours",
            "Activate advanced pattern recognition systems",
            "Brief all floor managers on fraud indicators"
          ]
        },
        {
          id: "advisory-2",
          title: "New Counterfeit Currency Detected",
          description: "Regional law enforcement reports circulation of sophisticated counterfeit notes. Enhanced cash handling protocols activated.",
          severity: "medium",
          date: "2025-01-10T15:20:00Z",
          author: "Financial Crimes Unit",
          recommendations: [
            "Update all cash handling staff on new counterfeit indicators",
            "Increase frequency of currency verification checks",
            "Coordinate with local law enforcement on suspicious transactions"
          ]
        },
        {
          id: "advisory-3",
          title: "Seasonal Security Considerations",
          description: "Tourist season approaches with increased foot traffic. Security protocols adjusted for higher capacity operations.",
          severity: "low",
          date: "2025-01-09T10:15:00Z",
          author: "Operations Security Team",
          recommendations: [
            "Additional security personnel scheduled for deployment",
            "Crowd control measures reviewed and updated",
            "Emergency evacuation procedures tested and validated"
          ]
        }
      ]);
    }

    if (endpoint.startsWith('/api/security/staff')) {
      return Promise.resolve([
        {
          id: "staff-1",
          name: "Marcus Johnson",
          position: "Head of Security",
          phone: "+94-77-123-4567",
          email: "m.johnson@ballyscolombo.lk",
          status: "on_duty",
          shift: "Day Shift (06:00-14:00)",
          location: "Security Command Center"
        },
        {
          id: "staff-2",
          name: "Sarah Chen",
          position: "Security Analyst",
          phone: "+94-77-234-5678",
          email: "s.chen@ballyscolombo.lk",
          status: "on_duty",
          shift: "Day Shift (08:00-16:00)",
          location: "Surveillance Room A"
        },
        {
          id: "staff-3",
          name: "David Rodriguez",
          position: "Floor Security Officer",
          phone: "+94-77-345-6789",
          email: "d.rodriguez@ballyscolombo.lk",
          status: "on_duty",
          shift: "Day Shift (10:00-18:00)",
          location: "Main Gaming Floor"
        },
        {
          id: "staff-4",
          name: "Lisa Thompson",
          position: "VIP Security Specialist",
          phone: "+94-77-456-7890",
          email: "l.thompson@ballyscolombo.lk",
          status: "on_duty",
          shift: "Day Shift (12:00-20:00)",
          location: "VIP Gaming Area"
        },
        {
          id: "staff-5",
          name: "Ahmed Hassan",
          position: "Entrance Security",
          phone: "+94-77-567-8901",
          email: "a.hassan@ballyscolombo.lk",
          status: "on_duty",
          shift: "Day Shift (06:00-14:00)",
          location: "Main Entrance"
        },
        {
          id: "staff-6",
          name: "Jennifer Wong",
          position: "IT Security Officer",
          phone: "+94-77-678-9012",
          email: "j.wong@ballyscolombo.lk",
          status: "on_duty",
          shift: "Day Shift (09:00-17:00)",
          location: "IT Security Center"
        },
        {
          id: "staff-7",
          name: "Michael O'Connor",
          position: "Night Security Supervisor",
          phone: "+94-77-789-0123",
          email: "m.oconnor@ballyscolombo.lk",
          status: "off_duty",
          shift: "Night Shift (22:00-06:00)",
          location: "Off Duty"
        },
        {
          id: "staff-8",
          name: "Priya Patel",
          position: "Compliance Security Officer",
          phone: "+94-77-890-1234",
          email: "p.patel@ballyscolombo.lk",
          status: "on_duty",
          shift: "Day Shift (07:00-15:00)",
          location: "Compliance Office"
        }
      ]);
    }

    // Compliance data
    // Drivers endpoints
    if (endpoint.startsWith('/api/drivers/schedules')) {
      return Promise.resolve([
        {
          id: "schedule-1",
          driver_name: "Marcus Silva",
          driver_id: "driver-1",
          date: "2025-01-11",
          shift_type: "Day Shift",
          shift_start: "06:00",
          shift_end: "14:00",
          vehicle_assigned: "BC-7890",
          route_assignment: "Airport Shuttle",
          status: "active"
        },
        {
          id: "schedule-2",
          driver_name: "Sarah Fernando",
          driver_id: "driver-2", 
          date: "2025-01-11",
          shift_type: "Afternoon Shift",
          shift_start: "14:00",
          shift_end: "22:00",
          vehicle_assigned: "BC-4567",
          route_assignment: "VIP Transport",
          status: "active"
        },
        {
          id: "schedule-3",
          driver_name: "David Perera",
          driver_id: "driver-3",
          date: "2025-01-11",
          shift_type: "Night Shift", 
          shift_start: "22:00",
          shift_end: "06:00",
          vehicle_assigned: "BC-2345",
          route_assignment: "Hotel Circuit",
          status: "scheduled"
        },
        {
          id: "schedule-4",
          driver_name: "Lisa Mendis",
          driver_id: "driver-4",
          date: "2025-01-12",
          shift_type: "Day Shift",
          shift_start: "06:00", 
          shift_end: "14:00",
          vehicle_assigned: "BC-6789",
          route_assignment: "City Tour",
          status: "pending"
        }
      ]);
    }

    if (endpoint.startsWith('/api/drivers/bookings')) {
      return Promise.resolve([
        {
          id: "booking-1",
          passenger_name: "Mr. James Wilson (VIP)",
          pickup_location: "Bandaranaike International Airport",
          destination: "Bally's Casino Colombo",
          pickup_time: "15:30",
          eta: "16:45",
          driver_name: "Marcus Silva",
          vehicle_number: "BC-7890",
          status: "in_progress",
          direction: "inbound",
          booking_type: "airport_transfer",
          passenger_phone: "+1-555-123-4567"
        },
        {
          id: "booking-2",
          passenger_name: "Mrs. Chen Wei (Diamond)",
          pickup_location: "Bally's Casino Colombo",
          destination: "Galle Face Hotel",
          pickup_time: "18:00", 
          eta: "18:25",
          driver_name: "Sarah Fernando",
          vehicle_number: "BC-4567",
          status: "confirmed",
          direction: "outbound",
          booking_type: "hotel_transfer",
          passenger_phone: "+65-9876-5432"
        },
        {
          id: "booking-3",
          passenger_name: "Mr. David Kumar (Platinum)",
          pickup_location: "Shangri-La Hotel",
          destination: "Bally's Casino Colombo",
          pickup_time: "19:15",
          eta: "19:40",
          driver_name: "Lisa Mendis",
          vehicle_number: "BC-6789",
          status: "assigned",
          direction: "inbound", 
          booking_type: "vip_pickup",
          passenger_phone: "+91-98765-43210"
        },
        {
          id: "booking-4",
          passenger_name: "Party of 6 - Corporate Event",
          pickup_location: "Bally's Casino Colombo",
          destination: "Colombo Port City",
          pickup_time: "20:30",
          eta: "21:00",
          driver_name: "David Perera", 
          vehicle_number: "BC-2345",
          status: "scheduled",
          direction: "outbound",
          booking_type: "group_transfer",
          passenger_phone: "+94-77-555-0123"
        }
      ]);
    }

    if (endpoint.startsWith('/api/drivers/locations')) {
      return Promise.resolve([
        {
          id: "location-1",
          driver_name: "Marcus Silva",
          vehicle_number: "BC-7890",
          current_location: "Galle Road, Colombo 3",
          destination: "Bally's Casino Colombo",
          direction: "inbound",
          status: "occupied",
          speed: "45",
          last_update: "2 minutes ago",
          eta: "12 minutes",
          passenger: "Mr. James Wilson"
        },
        {
          id: "location-2", 
          driver_name: "Sarah Fernando",
          vehicle_number: "BC-4567",
          current_location: "Bally's Casino Colombo - Main Entrance",
          destination: "Waiting for Assignment",
          direction: "stationary",
          status: "available", 
          speed: "0",
          last_update: "30 seconds ago",
          eta: "Ready",
          passenger: null
        },
        {
          id: "location-3",
          driver_name: "David Perera",
          vehicle_number: "BC-2345",
          current_location: "Negombo Road - Airport Vicinity",
          destination: "Bandaranaike International Airport",
          direction: "outbound",
          status: "available",
          speed: "65",
          last_update: "1 minute ago", 
          eta: "8 minutes",
          passenger: null
        },
        {
          id: "location-4",
          driver_name: "Lisa Mendis", 
          vehicle_number: "BC-6789",
          current_location: "Marine Drive, Colombo 3",
          destination: "Shangri-La Hotel",
          direction: "outbound",
          status: "occupied",
          speed: "35",
          last_update: "45 seconds ago",
          eta: "6 minutes",
          passenger: "Mrs. Amanda Foster"
        },
        {
          id: "location-5",
          driver_name: "Ahmed Hassan",
          vehicle_number: "BC-1234", 
          current_location: "Service Station - Fuel Stop",
          destination: "Maintenance Break",
          direction: "stationary",
          status: "maintenance",
          speed: "0",
          last_update: "5 minutes ago",
          eta: "15 minutes",
          passenger: null
        }
      ]);
    }

    if (endpoint.startsWith('/api/drivers') && !endpoint.includes('/')) {
      return Promise.resolve([
        {
          id: "driver-1",
          name: "Marcus Silva",
          phone: "+94-77-123-4567",
          email: "m.silva@ballyscolombo.lk",
          license_number: "B1234567",
          vehicle_number: "BC-7890",
          vehicle_type: "Luxury Sedan",
          status: "occupied",
          shift_start: "06:00",
          shift_end: "14:00",
          current_passenger: "Mr. James Wilson",
          rating: 4.8,
          total_rides: 1247,
          years_experience: 8
        },
        {
          id: "driver-2", 
          name: "Sarah Fernando",
          phone: "+94-77-234-5678",
          email: "s.fernando@ballyscolombo.lk",
          license_number: "B2345678", 
          vehicle_number: "BC-4567",
          vehicle_type: "SUV",
          status: "available",
          shift_start: "14:00",
          shift_end: "22:00",
          current_passenger: null,
          rating: 4.9,
          total_rides: 892,
          years_experience: 5
        },
        {
          id: "driver-3",
          name: "David Perera", 
          phone: "+94-77-345-6789",
          email: "d.perera@ballyscolombo.lk",
          license_number: "B3456789",
          vehicle_number: "BC-2345",
          vehicle_type: "Van",
          status: "available", 
          shift_start: "22:00",
          shift_end: "06:00",
          current_passenger: null,
          rating: 4.7,
          total_rides: 654,
          years_experience: 6
        },
        {
          id: "driver-4",
          name: "Lisa Mendis",
          phone: "+94-77-456-7890",
          email: "l.mendis@ballyscolombo.lk",
          license_number: "B4567890",
          vehicle_number: "BC-6789",
          vehicle_type: "Luxury Sedan",
          status: "occupied",
          shift_start: "06:00",
          shift_end: "14:00",
          current_passenger: "Mrs. Amanda Foster",
          rating: 4.9,
          total_rides: 1089,
          years_experience: 7
        },
        {
          id: "driver-5",
          name: "Ahmed Hassan",
          phone: "+94-77-567-8901", 
          email: "a.hassan@ballyscolombo.lk",
          license_number: "B5678901",
          vehicle_number: "BC-1234",
          vehicle_type: "Sedan",
          status: "maintenance",
          shift_start: "14:00",
          shift_end: "22:00",
          current_passenger: null,
          rating: 4.6,
          total_rides: 543,
          years_experience: 4
        },
        {
          id: "driver-6",
          name: "Priya Jayawardena",
          phone: "+94-77-678-9012",
          email: "p.jayawardena@ballyscolombo.lk", 
          license_number: "B6789012",
          vehicle_number: "BC-5678",
          vehicle_type: "Limousine",
          status: "on_duty",
          shift_start: "18:00",
          shift_end: "02:00",
          current_passenger: null,
          rating: 5.0,
          total_rides: 234,
          years_experience: 3
        },
        {
          id: "driver-7", 
          name: "Ravi Wickramasinghe",
          phone: "+94-77-789-0123",
          email: "r.wickramasinghe@ballyscolombo.lk",
          license_number: "B7890123",
          vehicle_number: "BC-9012",
          vehicle_type: "SUV",
          status: "off_duty",
          shift_start: "06:00",
          shift_end: "14:00", 
          current_passenger: null,
          rating: 4.4,
          total_rides: 445,
          years_experience: 2
        }
      ]);
    }

    // Maintenance endpoints
    if (endpoint.startsWith('/api/maintenance/facilities')) {
      return Promise.resolve([
        {
          id: "facility-1",
          name: "HVAC System - Main Floor",
          equipment_id: "HVAC-001",
          location: "Main Gaming Floor",
          status: "operational",
          type: "facility",
          manufacturer: "Carrier",
          model: "WeatherExpert 50TCQ",
          last_maintenance: "2025-01-05",
          assigned_technician: "Maria Santos"
        },
        {
          id: "facility-2", 
          name: "LED Lighting - VIP Area",
          equipment_id: "LED-VIP-02",
          location: "VIP Gaming Area",
          status: "maintenance",
          type: "facility",
          manufacturer: "Philips",
          model: "CoreLine LED",
          last_maintenance: "2025-01-08",
          assigned_technician: "Ahmed Hassan"
        },
        {
          id: "facility-3",
          name: "Fire Suppression System",
          equipment_id: "FIRE-MAIN-01",
          location: "Entire Building",
          status: "operational",
          type: "facility",
          manufacturer: "Tyco",
          model: "CPVC Sprinkler System",
          last_maintenance: "2024-12-20",
          assigned_technician: "John Silva"
        },
        {
          id: "facility-4",
          name: "Security Camera Network",
          equipment_id: "CAM-NET-01",
          location: "Casino Perimeter",
          status: "operational",
          type: "security",
          manufacturer: "Hikvision",
          model: "DS-2CD2385G1-I",
          last_maintenance: "2025-01-03",
          assigned_technician: "David Chen"
        },
        {
          id: "facility-5",
          name: "Emergency Backup Generator",
          equipment_id: "GEN-BACKUP-01",
          location: "Basement - Utility Room",
          status: "scheduled",
          type: "facility",
          manufacturer: "Caterpillar",
          model: "C15 500kW",
          last_maintenance: "2024-11-15",
          assigned_technician: "Ahmed Hassan"
        }
      ]);
    }

    if (endpoint.startsWith('/api/maintenance/machines')) {
      return Promise.resolve([
        {
          id: "machine-1",
          name: "Lightning Link Slot",
          equipment_id: "SLT-247",
          location: "Main Gaming Floor - Row A",
          status: "out_of_order", 
          type: "machine",
          manufacturer: "Aristocrat",
          model: "Lightning Link",
          last_maintenance: "2024-12-28",
          assigned_technician: "Lisa Perera"
        },
        {
          id: "machine-2",
          name: "Blackjack Table #3",
          equipment_id: "BJ-003",
          location: "Table Games Area",
          status: "operational",
          type: "machine",
          manufacturer: "Shuffle Master",
          model: "I-Deal+",
          last_maintenance: "2025-01-04",
          assigned_technician: "Lisa Perera"
        },
        {
          id: "machine-3",
          name: "Roulette Wheel - European",
          equipment_id: "RW-EUR-01",
          location: "High Limit Area",
          status: "operational",
          type: "machine", 
          manufacturer: "Cammegh",
          model: "Mercury 360",
          last_maintenance: "2025-01-02",
          assigned_technician: "John Silva"
        },
        {
          id: "machine-4",
          name: "Buffalo Gold Slot",
          equipment_id: "SLT-189",
          location: "Main Gaming Floor - Row C",
          status: "maintenance",
          type: "machine",
          manufacturer: "Aristocrat",
          model: "Buffalo Gold",
          last_maintenance: "2025-01-09",
          assigned_technician: "Lisa Perera"
        },
        {
          id: "machine-5",
          name: "Baccarat Shoe #2",
          equipment_id: "BAC-002",
          location: "VIP Gaming Area",
          status: "operational",
          type: "machine",
          manufacturer: "Shuffle Master",
          model: "Batch Shuffler",
          last_maintenance: "2024-12-30",
          assigned_technician: "John Silva"
        },
        {
          id: "machine-6",
          name: "Wheel of Fortune Slot",
          equipment_id: "SLT-356",
          location: "Main Gaming Floor - Row B",
          status: "scheduled",
          type: "machine",
          manufacturer: "IGT",
          model: "Wheel of Fortune 4D",
          last_maintenance: "2024-12-15",
          assigned_technician: "Lisa Perera"
        }
      ]);
    }

    if (endpoint.startsWith('/api/maintenance/terminals')) {
      return Promise.resolve([
        {
          id: "terminal-1",
          name: "POS Terminal - Main Bar",
          equipment_id: "POS-BAR-01",
          location: "Main Bar Counter",
          status: "operational",
          type: "terminal",
          manufacturer: "Square",
          model: "Register Stand",
          last_maintenance: "2025-01-07",
          assigned_technician: "David Chen"
        },
        {
          id: "terminal-2",
          name: "Player Tracking Kiosk #5",
          equipment_id: "PTK-005",
          location: "Main Gaming Floor - Center",
          status: "maintenance",
          type: "terminal",
          manufacturer: "Everi",
          model: "CashClub Wallet",
          last_maintenance: "2025-01-10",
          assigned_technician: "David Chen"
        },
        {
          id: "terminal-3", 
          name: "ATM - Casino Entrance",
          equipment_id: "ATM-ENT-01",
          location: "Main Entrance Lobby",
          status: "operational",
          type: "terminal",
          manufacturer: "NCR",
          model: "SelfServ 84",
          last_maintenance: "2025-01-01",
          assigned_technician: "David Chen"
        },
        {
          id: "terminal-4",
          name: "Digital Display - Promotions",
          equipment_id: "DISP-PROMO-01",
          location: "Main Gaming Floor - Wall",
          status: "out_of_order",
          type: "terminal",
          manufacturer: "Samsung",
          model: "QM75R 4K Display",
          last_maintenance: "2024-12-25",
          assigned_technician: "Ahmed Hassan"
        },
        {
          id: "terminal-5",
          name: "Ticket Redemption Kiosk",
          equipment_id: "TRK-001",
          location: "Cashier Area",
          status: "operational", 
          type: "terminal",
          manufacturer: "IGT",
          model: "Resort Wallet",
          last_maintenance: "2025-01-06",
          assigned_technician: "David Chen"
        }
      ]);
    }

    if (endpoint.startsWith('/api/maintenance/tickets')) {
      return Promise.resolve([
        {
          id: "ticket-1",
          title: "Slot Machine 247 - Not Accepting Coins",
          description: "Machine is not accepting coin input. Display shows 'COIN JAM' error. Attempted to clear jam but issue persists. Requires technician inspection.",
          category: "machine",
          priority: "high",
          status: "assigned",
          location: "Main Gaming Floor - Row A",
          equipment_id: "SLT-247",
          assigned_to: "Lisa Perera - Gaming Tech",
          created_at: "2025-01-11T09:30:00Z",
          due_date: "2025-01-11T18:00:00Z"
        },
        {
          id: "ticket-2",
          title: "HVAC Temperature Control - VIP Area Too Warm",
          description: "VIP gaming area temperature reading 28°C. Guests complaining. Thermostat appears functional but cooling not responding. May need refrigerant check.",
          category: "facility", 
          priority: "medium",
          status: "in_progress",
          location: "VIP Gaming Area",
          equipment_id: "HVAC-VIP-02",
          assigned_to: "Maria Santos - Facilities",
          created_at: "2025-01-11T08:15:00Z",
          due_date: "2025-01-12T12:00:00Z"
        },
        {
          id: "ticket-3",
          title: "POS System Crashing - Main Bar",
          description: "Point of sale system at main bar keeps crashing during transaction processing. Error code POS-ERR-404. Affects customer service significantly.",
          category: "terminal",
          priority: "critical", 
          status: "open",
          location: "Main Bar Counter",
          equipment_id: "POS-BAR-01",
          assigned_to: "David Chen - IT Tech", 
          created_at: "2025-01-11T14:20:00Z",
          due_date: "2025-01-11T16:00:00Z"
        },
        {
          id: "ticket-4",
          title: "Emergency Lighting - Corridor B Not Working",
          description: "Emergency lighting fixtures in corridor B (near restrooms) are not functioning. Affects emergency evacuation visibility. Safety concern.",
          category: "facility",
          priority: "high",
          status: "assigned",
          location: "Corridor B - Near Restrooms", 
          equipment_id: "EMRG-LT-COR-B",
          assigned_to: "Ahmed Hassan - Electrical",
          created_at: "2025-01-11T07:45:00Z",
          due_date: "2025-01-11T20:00:00Z"
        },
        {
          id: "ticket-5",
          title: "Blackjack Table #3 - Card Shuffler Malfunction",
          description: "Automatic card shuffler making unusual grinding noise. Occasionally jams during shuffle cycle. Disrupts game flow. Recommend inspection.",
          category: "machine",
          priority: "medium",
          status: "resolved",
          location: "Table Games Area",
          equipment_id: "BJ-003",
          assigned_to: "John Silva - Senior Tech",
          created_at: "2025-01-10T16:30:00Z",
          due_date: "2025-01-11T12:00:00Z"
        },
        {
          id: "ticket-6",
          title: "Player Tracking Kiosk - Screen Flickering", 
          description: "Touch screen on player tracking kiosk #5 has intermittent flickering. Sometimes unresponsive to touch. Affects player experience.",
          category: "terminal",
          priority: "low",
          status: "scheduled",
          location: "Main Gaming Floor - Center",
          equipment_id: "PTK-005",
          assigned_to: "David Chen - IT Tech",
          created_at: "2025-01-11T11:00:00Z", 
          due_date: "2025-01-13T10:00:00Z"
        }
      ]);
    }

    // Onboarding endpoints  
    if (endpoint.startsWith('/api/onboarding/applications')) {
      return Promise.resolve([
        {
          id: "app-1",
          first_name: "James",
          last_name: "Wilson",
          email: "james.wilson@email.com",
          phone: "+1-555-123-4567",
          date_of_birth: "1985-03-15",
          nationality: "American",
          passport_number: "US123456789",
          nic_number: null,
          address: "1234 Main Street, New York, NY 10001, USA",
          membership_type: "vip",
          marketing_consent: true,
          source: "referral",
          status: "pending",
          compliance_risk: "low",
          marketing_campaigns: ["VIP Welcome Package", "High Roller Bonuses"],
          compliance_notes: "Clean background check. Source of funds verified.",
          referral_code: "REF-VIP-001",
          created_at: "2025-01-11T09:30:00Z",
          updated_at: "2025-01-11T09:30:00Z"
        },
        {
          id: "app-2",
          first_name: "Priya",
          last_name: "Sharma",
          email: "priya.sharma@email.com", 
          phone: "+91-98765-43210",
          date_of_birth: "1990-07-22",
          nationality: "Indian",
          passport_number: "IN987654321",
          nic_number: null,
          address: "Block 15, Sector 18, Noida, Uttar Pradesh, India",
          membership_type: "premium",
          marketing_consent: true,
          source: "online",
          status: "compliance_check",
          compliance_risk: "medium",
          marketing_campaigns: ["Premium Member Benefits", "Asian Market Promotions"],
          compliance_notes: "Additional documentation required for source of funds verification.",
          created_at: "2025-01-10T14:20:00Z",
          updated_at: "2025-01-11T08:15:00Z"
        },
        {
          id: "app-3",
          first_name: "David",
          last_name: "Chen",
          email: "david.chen@email.com",
          phone: "+65-9876-5432",
          date_of_birth: "1978-12-08",
          nationality: "British",
          passport_number: "GB456789123",
          nic_number: null,
          address: "88 Marina Bay, Singapore 018962",
          membership_type: "standard",
          marketing_consent: false,
          source: "walk_in",
          status: "document_verification",
          compliance_risk: "low",
          compliance_notes: "Standard verification in progress. Documents uploaded successfully.",
          created_at: "2025-01-10T16:45:00Z",
          updated_at: "2025-01-11T10:20:00Z"
        },
        {
          id: "app-4",
          first_name: "Samantha",
          last_name: "De Silva",
          email: "samantha.desilva@email.com",
          phone: "+94-77-123-4567",
          date_of_birth: "1992-05-18",
          nationality: "Sri Lankan",
          passport_number: "N1234567",
          nic_number: "199215610234",
          address: "123 Galle Road, Colombo 3, Sri Lanka",
          membership_type: "temporary",
          marketing_consent: true,
          source: "marketing_campaign",
          status: "approved",
          compliance_risk: "low",
          marketing_campaigns: ["Local Resident Special", "Weekend Gaming Package"],
          compliance_notes: "Approved for temporary membership. Local resident verification complete.",
          created_at: "2025-01-09T11:30:00Z",
          updated_at: "2025-01-10T15:45:00Z"
        },
        {
          id: "app-5",
          first_name: "Mohammed",
          last_name: "Al-Rahman",
          email: "mohammed.alrahman@email.com",
          phone: "+971-50-123-4567",
          date_of_birth: "1980-11-25",
          nationality: "Emirati",
          passport_number: "UAE789123456",
          nic_number: null,
          address: "Dubai Marina, Dubai, UAE",
          membership_type: "vip",
          marketing_consent: true,
          source: "travel_partner",
          status: "under_review",
          compliance_risk: "high",
          marketing_campaigns: ["Middle East VIP Program"],
          compliance_notes: "High-value application. Enhanced due diligence required. Travel partner verification pending.",
          created_at: "2025-01-11T07:15:00Z",
          updated_at: "2025-01-11T07:15:00Z"
        },
        {
          id: "app-6",
          first_name: "Emma",
          last_name: "Thompson",
          email: "emma.thompson@email.com",
          phone: "+61-4-1234-5678",
          date_of_birth: "1987-09-12",
          nationality: "Australian",
          passport_number: "AU345678912",
          nic_number: null,
          address: "456 Collins Street, Melbourne, VIC 3000, Australia",
          membership_type: "premium",
          marketing_consent: true,
          source: "referral",
          status: "rejected",
          compliance_risk: "high",
          compliance_notes: "Rejected due to failed AML screening. Adverse media findings.",
          referral_code: "REF-AUS-002",
          created_at: "2025-01-08T13:20:00Z",
          updated_at: "2025-01-09T16:30:00Z"
        }
      ]);
    }

    if (endpoint.startsWith('/api/onboarding/documents')) {
      return Promise.resolve([
        {
          id: "doc-1",
          applicant_name: "James Wilson",
          document_type: "Passport",
          document_number: "US123456789",
          uploaded_at: "2025-01-11T10:15:00Z",
          expiry_date: "2030-03-15",
          verification_status: "verified",
          verification_notes: "Document verified successfully. High quality scan provided."
        },
        {
          id: "doc-2",
          applicant_name: "Priya Sharma",
          document_type: "Passport",
          document_number: "IN987654321",
          uploaded_at: "2025-01-10T15:30:00Z",
          expiry_date: "2028-07-22",
          verification_status: "pending",
          verification_notes: "Document under review. Additional verification required."
        },
        {
          id: "doc-3",
          applicant_name: "David Chen",
          document_type: "Passport", 
          document_number: "GB456789123",
          uploaded_at: "2025-01-10T17:00:00Z",
          expiry_date: "2029-12-08",
          verification_status: "pending",
          verification_notes: "Standard verification in progress."
        },
        {
          id: "doc-4",
          applicant_name: "Samantha De Silva",
          document_type: "NIC",
          document_number: "199215610234",
          uploaded_at: "2025-01-09T12:00:00Z",
          expiry_date: null,
          verification_status: "verified",
          verification_notes: "Sri Lankan NIC verified against government database."
        },
        {
          id: "doc-5",
          applicant_name: "Samantha De Silva",
          document_type: "Passport",
          document_number: "N1234567",
          uploaded_at: "2025-01-09T12:05:00Z",
          expiry_date: "2027-05-18",
          verification_status: "verified",
          verification_notes: "Sri Lankan passport verified successfully."
        },
        {
          id: "doc-6",
          applicant_name: "Mohammed Al-Rahman",
          document_type: "Bank Statement",
          document_number: "ADCB-2025-001",
          uploaded_at: "2025-01-11T08:30:00Z",
          expiry_date: null,
          verification_status: "under_review",
          verification_notes: "Source of funds documentation under enhanced review."
        }
      ]);
    }

    if (endpoint.startsWith('/api/onboarding/compliance')) {
      return Promise.resolve([
        {
          id: "comp-1",
          applicant_name: "James Wilson",
          risk_level: "low",
          status: "completed",
          aml_status: "clear",
          pep_status: "negative",
          sanctions_status: "clear",
          kyc_score: 92,
          source_of_funds: "Business Income",
          background_check: "clean",
          compliance_notes: "Comprehensive screening completed. No adverse findings. Source of funds verified through business documentation.",
          checked_at: "2025-01-11T11:00:00Z",
          compliance_officer: "Sarah Chen"
        },
        {
          id: "comp-2",
          applicant_name: "Priya Sharma",
          risk_level: "medium",
          status: "in_progress",
          aml_status: "pending",
          pep_status: "negative",
          sanctions_status: "clear",
          kyc_score: 78,
          source_of_funds: "Employment",
          background_check: "pending",
          compliance_notes: "Enhanced due diligence in progress. Additional documentation requested for employment verification.",
          checked_at: "2025-01-11T09:30:00Z",
          compliance_officer: "David Rodriguez"
        },
        {
          id: "comp-3",
          applicant_name: "David Chen",
          risk_level: "low",
          status: "in_progress",
          aml_status: "clear",
          pep_status: "negative",
          sanctions_status: "clear",
          kyc_score: 85,
          source_of_funds: "Investment Income",
          background_check: "clear",
          compliance_notes: "Standard KYC process ongoing. Investment portfolio verification in progress.",
          checked_at: "2025-01-11T10:45:00Z",
          compliance_officer: "Sarah Chen"
        },
        {
          id: "comp-4",
          applicant_name: "Mohammed Al-Rahman",
          risk_level: "high",
          status: "enhanced_review",
          aml_status: "enhanced_review",
          pep_status: "potential_match",
          sanctions_status: "clear",
          kyc_score: 65,
          source_of_funds: "Business Ownership",
          background_check: "enhanced_review",
          compliance_notes: "Enhanced due diligence required. Potential PEP match identified. Business ownership structure under review.",
          checked_at: "2025-01-11T08:00:00Z",
          compliance_officer: "Marcus Johnson"
        },
        {
          id: "comp-5",
          applicant_name: "Emma Thompson",
          risk_level: "high",
          status: "rejected",
          aml_status: "adverse_findings",
          pep_status: "negative",
          sanctions_status: "clear",
          kyc_score: 35,
          source_of_funds: "Unknown",
          background_check: "adverse_findings",
          compliance_notes: "Application rejected due to adverse media findings and inability to verify source of funds. Multiple red flags identified.",
          checked_at: "2025-01-09T15:00:00Z",
          compliance_officer: "Marcus Johnson"
        }
      ]);
    }

    if (endpoint.startsWith('/api/onboarding/workflow')) {
      return Promise.resolve([
        {
          id: "wf-1",
          applicant_name: "James Wilson",
          current_stage: "approved",
          completion_percentage: 100,
          estimated_completion: "Complete",
          stages: [
            { name: "Application Submitted", completed: true, active: false, completed_at: "2025-01-11T09:30:00Z" },
            { name: "Document Upload", completed: true, active: false, completed_at: "2025-01-11T10:15:00Z" },
            { name: "Document Verification", completed: true, active: false, completed_at: "2025-01-11T10:45:00Z" },
            { name: "Compliance Screening", completed: true, active: false, completed_at: "2025-01-11T11:30:00Z" },
            { name: "Risk Assessment", completed: true, active: false, completed_at: "2025-01-11T12:00:00Z" },
            { name: "Final Approval", completed: true, active: false, completed_at: "2025-01-11T12:30:00Z" },
            { name: "Member Setup", completed: true, active: false, completed_at: "2025-01-11T13:00:00Z" }
          ]
        },
        {
          id: "wf-2",
          applicant_name: "Priya Sharma",
          current_stage: "compliance_screening",
          completion_percentage: 60,
          estimated_completion: "2-3 business days",
          stages: [
            { name: "Application Submitted", completed: true, active: false, completed_at: "2025-01-10T14:20:00Z" },
            { name: "Document Upload", completed: true, active: false, completed_at: "2025-01-10T15:30:00Z" },
            { name: "Document Verification", completed: true, active: false, completed_at: "2025-01-11T08:00:00Z" },
            { name: "Compliance Screening", completed: false, active: true, completed_at: null },
            { name: "Risk Assessment", completed: false, active: false, completed_at: null },
            { name: "Final Approval", completed: false, active: false, completed_at: null },
            { name: "Member Setup", completed: false, active: false, completed_at: null }
          ]
        },
        {
          id: "wf-3",
          applicant_name: "David Chen",
          current_stage: "document_verification",
          completion_percentage: 40,
          estimated_completion: "1-2 business days",
          stages: [
            { name: "Application Submitted", completed: true, active: false, completed_at: "2025-01-10T16:45:00Z" },
            { name: "Document Upload", completed: true, active: false, completed_at: "2025-01-10T17:00:00Z" },
            { name: "Document Verification", completed: false, active: true, completed_at: null },
            { name: "Compliance Screening", completed: false, active: false, completed_at: null },
            { name: "Risk Assessment", completed: false, active: false, completed_at: null },
            { name: "Final Approval", completed: false, active: false, completed_at: null },
            { name: "Member Setup", completed: false, active: false, completed_at: null }
          ]
        },
        {
          id: "wf-4",
          applicant_name: "Mohammed Al-Rahman",
          current_stage: "enhanced_review",
          completion_percentage: 30,
          estimated_completion: "5-7 business days",
          stages: [
            { name: "Application Submitted", completed: true, active: false, completed_at: "2025-01-11T07:15:00Z" },
            { name: "Document Upload", completed: true, active: false, completed_at: "2025-01-11T08:30:00Z" },
            { name: "Document Verification", completed: false, active: false, completed_at: null },
            { name: "Enhanced Due Diligence", completed: false, active: true, completed_at: null },
            { name: "Senior Management Review", completed: false, active: false, completed_at: null },
            { name: "Final Decision", completed: false, active: false, completed_at: null },
            { name: "Member Setup", completed: false, active: false, completed_at: null }
          ]
        }
      ]);
    }

    // Compliance data  
    if (endpoint.startsWith('/api/compliance')) {
      return Promise.resolve({
        reports: [
          {
            id: "comp-1",
            report_type: "AML",
            status: "completed",
            generated_date: "2025-01-08",
            report_period_start: "2024-12-01",
            report_period_end: "2024-12-31",
            findings: "No issues detected",
            compliance_score: 98.5,
            violations: [],
            created_at: "2025-01-08T10:00:00Z"
          },
          {
            id: "comp-2",
            report_type: "PDPA",
            status: "in_progress",
            generated_date: "2025-01-09",
            report_period_start: "2024-11-01",
            report_period_end: "2024-11-30",
            findings: "Under review",
            compliance_score: 95.0,
            violations: [
              {
                severity: "medium",
                type: "data_retention",
                description: "Some customer data retention periods exceed recommended guidelines",
                recommendation: "Review and update data retention policies for customer information"
              }
            ],
            created_at: "2025-01-09T09:00:00Z"
          }
        ],
        total: 8,
        compliance_overview: {
          overall_score: 96.8,
          last_audit: "2024-12-15",
          next_audit: "2025-03-15",
          critical_issues: 0,
          warnings: 2
        }
      });
    }

    // Compliance data  
    if (endpoint.startsWith('/api/compliance')) {
      return Promise.resolve({
        audit_logs: [
          {
            id: "audit-1",
            admin_username: "Super Administrator",
            action: "updated",
            resource: "member",
            resource_id: "member-123",
            timestamp: "2025-01-09T15:30:00Z",
            ip_address: "192.168.1.100",
            risk_level: "low",
            risk_score: 1,
            details: { field_changed: "tier", old_value: "Ruby", new_value: "Diamond" }
          },
          {
            id: "audit-2", 
            admin_username: "Casino Manager",
            action: "created",
            resource: "gaming_session",
            resource_id: "session-456",
            timestamp: "2025-01-09T14:15:00Z",
            ip_address: "192.168.1.101",
            risk_level: "medium",
            risk_score: 3,
            details: { amount: 50000, table: "VIP-01" }
          }
        ],
        summary: {
          actions_breakdown: {
            "create": 45,
            "update": 78,
            "delete": 12,
            "view": 234
          },
          resources_breakdown: {
            "member": 89,
            "gaming_session": 67,
            "transaction": 123
          },
          admin_activity: {
            "Super Administrator": 145,
            "Casino Manager": 89,
            "Floor Supervisor": 67
          },
          high_risk_activities: 3
        },
        total: 369,
        page: 1,
        pages: 15
      });
    }

    // Data Retention Policies
    if (endpoint.startsWith('/api/data-retention/policies')) {
      return Promise.resolve([
        {
          id: "policy-1",
          policy_name: "Customer Data Retention",
          data_category: "customer_personal",
          retention_period_days: 2555, // 7 years
          archive_after_days: 1095, // 3 years
          auto_delete: true,
          status: "active",
          legal_basis: "PDPA 2022 Compliance",
          next_review_date: "2025-06-01"
        },
        {
          id: "policy-2",
          policy_name: "Gaming Transaction Records",
          data_category: "financial_transactions",
          retention_period_days: 2555, // 7 years  
          archive_after_days: 1825, // 5 years
          auto_delete: true,
          status: "active",
          legal_basis: "AML/CFT Requirements",
          next_review_date: "2025-03-15"
        },
        {
          id: "policy-3",
          policy_name: "Audit Logs",
          data_category: "system_logs",
          retention_period_days: 1095, // 3 years
          archive_after_days: 365, // 1 year
          auto_delete: false,
          status: "active",
          legal_basis: "Internal Security Policy",
          next_review_date: "2025-12-01"
        }
      ]);
    }

    // Advanced Analytics - EXTENSIVE MOCK DATA
    if (endpoint.startsWith('/api/analytics/advanced')) {
      return Promise.resolve([
        {
          id: "analytics-001",
          analysis_type: "customer_ltv",
          analysis_date: "2025-01-11T10:00:00Z",
          time_period: "quarterly",
          confidence_score: 96.8,
          data_points: {
            avg_ltv: 4850.75,
            total_ltv: 12150000,
            high_value_customers: 247,
            medium_value_customers: 893,
            low_value_customers: 1456,
            churn_risk_reduction: 0.28,
            revenue_increase: 0.22,
            growth_rate: 0.185
          },
          segment_analysis: {
            vip: { count: 89, avg_ltv: 15420.50, revenue_contribution: 0.45 },
            diamond: { count: 158, avg_ltv: 8750.25, revenue_contribution: 0.35 },
            sapphire: { count: 421, avg_ltv: 3240.75, revenue_contribution: 0.15 },
            ruby: { count: 928, avg_ltv: 1250.30, revenue_contribution: 0.05 }
          },
          insights: [
            "VIP members show 420% higher lifetime value compared to regular members",
            "Diamond tier customers have highest retention rate at 94.2%",
            "Customers who engage with loyalty programs stay 3.2x longer",
            "Mobile gaming sessions predict higher spending with 91% accuracy",
            "Weekend players spend 65% more than weekday-only players",
            "Live dealer games correlate with 2.8x higher customer lifetime value"
          ],
          recommended_actions: [
            "Implement targeted VIP retention campaigns with personalized experiences",
            "Expand mobile gaming offerings to capture high-value segments",
            "Develop weekend-specific promotions to maximize player engagement",
            "Introduce live dealer games to increase customer lifetime value"
          ],
          charts_data: {
            ltv_by_tier: [
              { tier: "VIP", value: 15420.50, count: 89 },
              { tier: "Diamond", value: 8750.25, count: 158 },
              { tier: "Sapphire", value: 3240.75, count: 421 },
              { tier: "Ruby", value: 1250.30, count: 928 }
            ],
            monthly_trend: [
              { month: "Oct 2024", ltv: 3850.25 },
              { month: "Nov 2024", ltv: 4120.50 },
              { month: "Dec 2024", ltv: 4580.75 },
              { month: "Jan 2025", ltv: 4850.75 }
            ]
          }
        },
        {
          id: "analytics-002", 
          analysis_type: "churn_prediction",
          analysis_date: "2025-01-10T15:30:00Z",
          time_period: "monthly",
          confidence_score: 93.4,
          data_points: {
            at_risk_customers: 127,
            high_risk: 34,
            medium_risk: 58,
            low_risk: 35,
            churn_probability: 0.16,
            retention_potential: 0.81,
            intervention_roi: 4.7,
            predicted_revenue_loss: 285000
          },
          risk_factors: [
            { factor: "Inactive for 14+ days", weight: 0.35, affected_customers: 67 },
            { factor: "Declining session frequency", weight: 0.28, affected_customers: 89 },
            { factor: "Reduced average bet size", weight: 0.22, affected_customers: 45 },
            { factor: "No loyalty program engagement", weight: 0.15, affected_customers: 156 }
          ],
          insights: [
            "Customers inactive for 14+ days have 72% churn probability",
            "Personalized offers reduce churn by 52% within first week",
            "Gaming preference changes indicate early churn signals with 89% accuracy",
            "VIP customers who haven't visited in 7 days have 45% higher churn risk",
            "Mobile app engagement drops precede churn by 21 days on average"
          ],
          recommended_actions: [
            "Deploy automated re-engagement campaigns for inactive players",
            "Offer personalized gaming experiences based on historical preferences",
            "Implement VIP concierge outreach for high-value at-risk customers",
            "Create mobile push notification campaigns for app re-engagement"
          ],
          charts_data: {
            risk_distribution: [
              { risk: "High Risk", count: 34, potential_loss: 125000 },
              { risk: "Medium Risk", count: 58, potential_loss: 98000 },
              { risk: "Low Risk", count: 35, potential_loss: 62000 }
            ],
            churn_timeline: [
              { week: "Week 1", predicted_churn: 12 },
              { week: "Week 2", predicted_churn: 18 },
              { week: "Week 3", predicted_churn: 25 },
              { week: "Week 4", predicted_churn: 34 }
            ]
          }
        },
        {
          id: "analytics-003",
          analysis_type: "operational_efficiency",
          analysis_date: "2025-01-09T09:15:00Z",
          time_period: "weekly",
          confidence_score: 91.7,
          data_points: {
            efficiency_score: 0.87,
            cost_reduction: 185000,
            time_saved_hours: 520,
            automation_potential: 0.72,
            staff_utilization: 0.84,
            peak_efficiency_hours: "8PM-11PM"
          },
          efficiency_areas: [
            { area: "Staff Scheduling", current: 0.78, potential: 0.93, savings: 65000 },
            { area: "Table Management", current: 0.82, potential: 0.91, savings: 42000 },
            { area: "Customer Service", current: 0.89, potential: 0.96, savings: 38000 },
            { area: "Inventory Management", current: 0.75, potential: 0.88, savings: 40000 }
          ],
          insights: [
            "Staff scheduling optimization can reduce costs by 18% while maintaining service quality",
            "Automated KYC processes save 165 hours weekly and improve accuracy by 23%",
            "Peak hour table allocation increases revenue by $2.3M annually",
            "Predictive maintenance reduces equipment downtime by 34%",
            "Real-time analytics dashboards improve decision-making speed by 67%"
          ],
          recommended_actions: [
            "Implement AI-powered staff scheduling system",
            "Deploy predictive maintenance for gaming equipment",
            "Automate routine compliance and reporting tasks",
            "Optimize table allocation algorithms for peak hours"
          ]
        },
        {
          id: "analytics-004",
          analysis_type: "revenue_optimization",
          analysis_date: "2025-01-08T14:20:00Z",
          time_period: "monthly",
          confidence_score: 94.2,
          data_points: {
            total_revenue: 8750000,
            revenue_growth: 0.23,
            profit_margin: 0.34,
            revenue_per_customer: 3420.75,
            high_margin_games: 0.68,
            cross_sell_success: 0.41
          },
          revenue_streams: [
            { stream: "Table Games", revenue: 3850000, growth: 0.18, margin: 0.42 },
            { stream: "Slot Machines", revenue: 2940000, growth: 0.28, margin: 0.38 },
            { stream: "VIP Services", revenue: 1450000, growth: 0.35, margin: 0.55 },
            { stream: "Food & Beverage", revenue: 510000, growth: 0.12, margin: 0.28 }
          ],
          insights: [
            "VIP services show highest profit margins at 55% with 35% growth rate",
            "Slot machine revenue growing fastest at 28% month-over-month",
            "Cross-selling loyalty program increases customer spend by 67%",
            "Premium gaming experiences command 3.2x higher margins",
            "Weekend revenue 45% higher than weekdays across all segments"
          ],
          recommended_actions: [
            "Expand VIP service offerings to capture high-margin opportunities",
            "Invest in premium slot machine fleet for sustained growth",
            "Develop integrated loyalty program with cross-selling features",
            "Create weekend-specific premium gaming experiences"
          ]
        },
        {
          id: "analytics-005",
          analysis_type: "player_behavior",
          analysis_date: "2025-01-07T11:45:00Z",
          time_period: "weekly",
          confidence_score: 88.9,
          data_points: {
            avg_session_duration: 145.5,
            games_per_session: 8.7,
            peak_activity_time: "9:30 PM",
            mobile_vs_desktop: 0.62,
            new_vs_returning: 0.23,
            social_gaming_adoption: 0.34
          },
          behavior_patterns: [
            { pattern: "Weekend Warriors", percentage: 0.28, avg_spend: 450.75, sessions: 3.2 },
            { pattern: "Weekday Regulars", percentage: 0.34, avg_spend: 280.50, sessions: 5.8 },
            { pattern: "High Rollers", percentage: 0.12, avg_spend: 2850.25, sessions: 2.1 },
            { pattern: "Casual Players", percentage: 0.26, avg_spend: 125.30, sessions: 1.4 }
          ],
          insights: [
            "Weekend Warriors show highest revenue potential with concentrated high-value sessions",
            "Mobile players stay engaged 2.3x longer than desktop-only players",
            "Social gaming features increase session duration by 67%",
            "Live dealer interactions correlate with 45% higher spend per session",
            "Personalized game recommendations improve player satisfaction by 78%"
          ],
          recommended_actions: [
            "Develop targeted weekend campaigns for high-value players",
            "Enhance mobile gaming experience with exclusive features",
            "Expand social gaming offerings to increase engagement",
            "Implement AI-powered personalized game recommendations"
          ]
        }
      ]);
    }

    // Generate Analytics Report - Enhanced with real charts and comprehensive data
    if (endpoint.startsWith('/api/analytics/generate')) {
      return Promise.resolve({
        report_id: `report_${Date.now()}`,
        generated_at: new Date().toISOString(),
        analysis_type: "comprehensive_analysis",
        confidence_score: 95.8,
        executive_summary: {
          key_metrics: {
            total_revenue: 8750000,
            customer_count: 2596,
            avg_ltv: 4850.75,
            churn_rate: 0.16,
            efficiency_score: 0.87
          },
          top_insights: [
            "Revenue increased 23% month-over-month driven by VIP segment growth",
            "Customer lifetime value improved 22% through loyalty program optimization",
            "Operational efficiency gains saved $185K while improving service quality",
            "Churn prediction models identify at-risk customers with 93% accuracy"
          ],
          critical_actions: [
            "Expand VIP services - projected $2.4M additional annual revenue",
            "Implement AI scheduling - 18% cost reduction potential",
            "Deploy churn prevention campaigns - retain $285K at-risk revenue"
          ]
        },
        detailed_analysis: {
          customer_segments: [
            {
              segment: "VIP Players",
              count: 89,
              revenue: 3930000,
              ltv: 15420.50,
              retention: 0.962,
              growth_potential: "High"
            },
            {
              segment: "Diamond Members", 
              count: 158,
              revenue: 2845000,
              ltv: 8750.25,
              retention: 0.942,
              growth_potential: "High"
            },
            {
              segment: "Regular Players",
              count: 1349,
              revenue: 1975000,
              ltv: 2240.35,
              retention: 0.782,
              growth_potential: "Medium"
            },
            {
              segment: "New Players",
              count: 1000,
              revenue: 450000,
              ltv: 450.00,
              retention: 0.234,
              growth_potential: "High"
            }
          ],
          revenue_breakdown: {
            table_games: { revenue: 3850000, margin: 0.42, trend: "up" },
            slots: { revenue: 2940000, margin: 0.38, trend: "up" },
            vip_services: { revenue: 1450000, margin: 0.55, trend: "up" },
            dining: { revenue: 510000, margin: 0.28, trend: "stable" }
          },
          predictive_models: {
            churn_prevention: {
              accuracy: 93.4,
              at_risk_customers: 127,
              potential_savings: 285000
            },
            revenue_forecasting: {
              accuracy: 91.7,
              next_month_prediction: 9125000,
              confidence_interval: [8850000, 9400000]
            },
            customer_ltv: {
              accuracy: 96.8,
              avg_predicted_ltv: 5120.45,
              high_value_pipeline: 67
            }
          }
        },
        charts_data: {
          revenue_trend: [
            { month: "Aug 2024", revenue: 6850000, target: 7000000 },
            { month: "Sep 2024", revenue: 7120000, target: 7200000 },
            { month: "Oct 2024", revenue: 7450000, target: 7500000 },
            { month: "Nov 2024", revenue: 7850000, target: 7800000 },
            { month: "Dec 2024", revenue: 8340000, target: 8200000 },
            { month: "Jan 2025", revenue: 8750000, target: 8600000 }
          ],
          customer_distribution: [
            { segment: "VIP", count: 89, percentage: 3.4 },
            { segment: "Diamond", count: 158, percentage: 6.1 },
            { segment: "Sapphire", count: 421, percentage: 16.2 },
            { segment: "Ruby", count: 928, percentage: 35.7 },
            { segment: "New", count: 1000, percentage: 38.5 }
          ],
          game_performance: [
            { game: "Blackjack", revenue: 1850000, sessions: 12450, avg_bet: 148.67 },
            { game: "Roulette", revenue: 1520000, sessions: 8900, avg_bet: 170.79 },
            { game: "Baccarat", revenue: 1180000, sessions: 3200, avg_bet: 368.75 },
            { game: "Poker", revenue: 950000, sessions: 5670, avg_bet: 167.54 },
            { game: "Slots", revenue: 2940000, sessions: 45600, avg_bet: 64.47 }
          ],
          efficiency_metrics: [
            { metric: "Staff Utilization", current: 84, target: 90, benchmark: 87 },
            { metric: "Table Occupancy", current: 78, target: 85, benchmark: 82 },
            { metric: "Customer Satisfaction", current: 91, target: 95, benchmark: 89 },
            { metric: "Response Time", current: 87, target: 90, benchmark: 85 }
          ]
        },
        recommendations: [
          {
            priority: "High",
            category: "Revenue Growth",
            action: "Expand VIP Gaming Floor",
            impact: "Projected $2.4M annual revenue increase",
            timeline: "3 months",
            investment_required: 450000
          },
          {
            priority: "High", 
            category: "Cost Optimization",
            action: "Implement AI Staff Scheduling",
            impact: "18% reduction in labor costs ($185K annually)",
            timeline: "2 months",
            investment_required: 75000
          },
          {
            priority: "Medium",
            category: "Customer Retention",
            action: "Deploy Predictive Churn Prevention",
            impact: "Retain $285K at-risk revenue",
            timeline: "6 weeks",
            investment_required: 35000
          },
          {
            priority: "Medium",
            category: "Operational Efficiency", 
            action: "Optimize Table Allocation Algorithm",
            impact: "12% increase in table utilization",
            timeline: "4 weeks",
            investment_required: 25000
          }
        ]
      });
    }

    // Cost Optimization endpoints
    if (endpoint.startsWith('/api/optimization/cost-savings')) {
      return Promise.resolve([
        {
          id: "cost-1",
          optimization_type: "Energy Efficiency",
          potential_savings: 125000,
          implementation_cost: 45000,
          roi_months: 4,
          status: "recommended",
          description: "LED lighting conversion across gaming floor",
          environmental_impact: "Reduce CO2 by 15 tons annually"
        },
        {
          id: "cost-2",
          optimization_type: "Staff Scheduling",
          potential_savings: 89000,
          implementation_cost: 12000,
          roi_months: 2,
          status: "in_progress", 
          description: "AI-powered optimal shift scheduling system",
          environmental_impact: "Reduce operational overhead"
        },
        {
          id: "cost-3",
          optimization_type: "Inventory Management",
          potential_savings: 67000,
          implementation_cost: 25000,
          roi_months: 5,
          status: "completed",
          description: "Automated beverage inventory tracking",
          environmental_impact: "Reduce waste by 25%"
        }
      ]);
    }

    // Predictive Models endpoints  
    if (endpoint.startsWith('/api/predictive/models')) {
      return Promise.resolve([
        {
          id: "model-1",
          model_name: "VIP Conversion Predictor",
          accuracy: 89.5,
          model_type: "classification",
          last_trained: "2025-01-05T10:00:00Z",
          status: "active",
          predictions_today: 23,
          key_features: ["spend_pattern", "visit_frequency", "game_preference"],
          performance_metrics: {
            precision: 91.2,
            recall: 87.8,
            f1_score: 89.4
          }
        },
        {
          id: "model-2",
          model_name: "Churn Risk Assessment",
          accuracy: 82.7,
          model_type: "regression",
          last_trained: "2025-01-03T15:30:00Z", 
          status: "active",
          predictions_today: 45,
          key_features: ["days_since_last_visit", "total_losses", "tier_level"],
          performance_metrics: {
            precision: 84.1,
            recall: 81.3,
            f1_score: 82.7
          }
        },
        {
          id: "model-3",
          model_name: "Game Popularity Forecaster",
          accuracy: 76.2,
          model_type: "time_series",
          last_trained: "2025-01-01T09:00:00Z",
          status: "training",
          predictions_today: 12,
          key_features: ["historical_sessions", "seasonal_trends", "new_releases"],
          performance_metrics: {
            precision: 78.5,
            recall: 73.9,
            f1_score: 76.1
          }
        }
      ]);
    }

    // System Integrations
    if (endpoint.startsWith('/api/integrations')) {
      return Promise.resolve([
        {
          id: "int-1",
          name: "Payment Gateway",
          type: "payment",
          status: "active",
          provider: "Stripe",
          last_sync: "2025-01-09T15:00:00Z",
          sync_status: "success"
        },
        {
          id: "int-2",
          name: "CRM System",
          type: "customer",
          status: "active", 
          provider: "Salesforce",
          last_sync: "2025-01-09T14:30:00Z",
          sync_status: "success"
        },
        {
          id: "int-3",
          name: "Security Monitoring",
          type: "security",
          status: "inactive",
          provider: "DataDog",
          last_sync: "2025-01-08T10:00:00Z",
          sync_status: "error"
        }
      ]);
    }

    // Real-time Events
    if (endpoint.startsWith('/api/analytics/real-time-events')) {
      return Promise.resolve({
        events: [
          {
            id: "event-1",
            type: "high_value_transaction",
            severity: "critical",
            message: "Large cash-in: $75,000 by VIP member",
            timestamp: "2025-01-09T15:45:00Z",
            member_id: "member-vip-001",
            details: { amount: 75000, method: "cash" }
          },
          {
            id: "event-2",
            type: "security_alert", 
            severity: "medium",
            message: "Multiple failed login attempts detected",
            timestamp: "2025-01-09T15:30:00Z",
            ip_address: "192.168.1.50",
            details: { attempts: 5, user: "unknown" }
          },
          {
            id: "event-3",
            type: "system_performance",
            severity: "low",
            message: "Database query optimization completed",
            timestamp: "2025-01-09T15:15:00Z",
            details: { performance_gain: "15%" }
          }
        ],
        total: 25,
        page: 1,
        pages: 3
      });
    }

    // User Activity Analytics  
    if (endpoint.startsWith('/api/analytics/user-activity')) {
      return Promise.resolve({
        daily_active_users: 89,
        peak_hours: ["20:00", "21:00", "22:00"],
        user_sessions: [
          { hour: "14:00", count: 23 },
          { hour: "15:00", count: 31 },
          { hour: "16:00", count: 28 },
          { hour: "17:00", count: 35 }
        ],
        top_features: [
          { feature: "Gaming Floor", usage: 78 },
          { feature: "Member Management", usage: 45 },
          { feature: "Analytics", usage: 32 }
        ]
      });
    }

    // Default fallback
    return Promise.reject(new Error('Endpoint not found'));
  }
}

export default new ApiService();