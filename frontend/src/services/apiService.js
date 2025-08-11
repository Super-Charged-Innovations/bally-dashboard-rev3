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
          duration: "4 hours",
          is_active: true,
          services: ["Private Table", "Premium Drinks", "Dedicated Host"]
        },
        {
          id: "pkg-2",
          name: "High Roller",
          description: "Elite gaming package for serious players",
          price: 50000,
          duration: "8 hours",
          is_active: true,
          services: ["VIP Room", "Premium Service", "Luxury Transportation"]
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

    // Staff data
    if (endpoint.startsWith('/api/staff')) {
      return Promise.resolve({
        staff_members: [
          {
            id: "staff-1",
            first_name: "Maria",
            last_name: "Rodriguez",
            department: "Gaming",
            position: "Dealer",
            employee_id: "EMP001",
            performance_score: 4.8,
            employment_status: "active"
          },
          {
            id: "staff-2",
            first_name: "James",
            last_name: "Chen",
            department: "Security",
            position: "Security Officer",
            employee_id: "EMP002", 
            performance_score: 4.6,
            employment_status: "active"
          }
        ],
        total_staff: 45,
        staff_by_department: { Gaming: 15, Security: 8, "F&B": 12, Management: 5, Maintenance: 5 },
        training_completion_rate: 87.5,
        average_performance_score: 4.7
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

    // Enhanced Audit Logs
    if (endpoint.startsWith('/api/audit/enhanced')) {
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

    // Advanced Analytics endpoints
    if (endpoint.startsWith('/api/analytics/advanced')) {
      return Promise.resolve([
        {
          id: "analytics-1",
          analysis_type: "customer_ltv",
          analysis_date: "2025-01-09T10:00:00Z",
          time_period: "quarterly",
          confidence_score: 94.8,
          data_points: {
            avg_ltv: 4250.75,
            high_value_customers: 156,
            churn_risk_reduction: 0.23,
            revenue_increase: 0.15
          },
          insights: [
            "VIP members show 340% higher lifetime value compared to regular members",
            "Customers who engage with loyalty programs stay 2.5x longer",
            "Mobile gaming sessions predict higher spending with 87% accuracy"
          ],
          recommended_actions: [
            "Implement targeted VIP retention campaigns",
            "Expand mobile gaming offerings"
          ]
        },
        {
          id: "analytics-2", 
          analysis_type: "churn_prediction",
          analysis_date: "2025-01-08T15:30:00Z",
          time_period: "monthly",
          confidence_score: 91.2,
          data_points: {
            at_risk_customers: 87,
            churn_probability: 0.18,
            retention_potential: 0.74,
            intervention_roi: 3.2
          },
          insights: [
            "Customers inactive for 14+ days have 67% churn probability",
            "Personalized offers reduce churn by 45% within first week",
            "Gaming preference changes indicate early churn signals"
          ],
          recommended_actions: [
            "Deploy automated re-engagement campaigns",
            "Offer personalized gaming experiences"
          ]
        },
        {
          id: "analytics-3",
          analysis_type: "operational_efficiency",
          analysis_date: "2025-01-07T09:15:00Z",
          time_period: "weekly",
          confidence_score: 89.5,
          data_points: {
            efficiency_score: 0.82,
            cost_reduction: 125000,
            time_saved_hours: 340,
            automation_potential: 0.65
          },
          insights: [
            "Staff scheduling optimization can reduce costs by 15%",
            "Automated KYC processes save 120 hours weekly",
            "Peak hour analysis reveals 23% improvement opportunity"
          ],
          recommended_actions: [
            "Implement AI-powered scheduling",
            "Expand process automation"
          ]
        }
      ]);
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
  }
}

export default new ApiService();