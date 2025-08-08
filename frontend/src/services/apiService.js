const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class ApiService {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
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
      
      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.reload();
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Dashboard endpoints
  async getDashboardMetrics() {
    return this.request('/dashboard/metrics');
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
    return this.request(`/members${query ? `?${query}` : ''}`);
  }

  async getMember(memberId) {
    return this.request(`/members/${memberId}`);
  }

  async updateMember(memberId, memberData) {
    return this.request(`/members/${memberId}`, {
      method: 'PUT',
      body: memberData,
    });
  }

  async updateMemberTier(memberId, newTier, reason) {
    return this.request(`/members/${memberId}/tier`, {
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
    return this.request(`/gaming/sessions${query ? `?${query}` : ''}`);
  }

  async getGamingPackages() {
    return this.request('/gaming/packages');
  }

  async createGamingPackage(packageData) {
    return this.request('/gaming/packages', {
      method: 'POST',
      body: packageData,
    });
  }

  async updateGamingPackage(packageId, packageData) {
    return this.request(`/gaming/packages/${packageId}`, {
      method: 'PUT',
      body: packageData,
    });
  }

  // Rewards management endpoints
  async getRewards() {
    return this.request('/rewards');
  }

  async createReward(rewardData) {
    return this.request('/rewards', {
      method: 'POST',
      body: rewardData,
    });
  }

  async updateReward(rewardId, rewardData) {
    return this.request(`/rewards/${rewardId}`, {
      method: 'PUT',
      body: rewardData,
    });
  }

  async deleteReward(rewardId) {
    return this.request(`/rewards/${rewardId}`, {
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
    return this.request(`/analytics/${type}${query ? `?${query}` : ''}`);
  }

  // Initialize sample data (for testing)
  async initializeSampleData() {
    return this.request('/init/sample-data', {
      method: 'POST',
    });
  }

  // Phase 2: Marketing Intelligence APIs
  async getMarketingDashboard() {
    return this.request('/marketing/dashboard');
  }

  async getBirthdayCalendar(month = null) {
    const params = month ? `?month=${month}` : '';
    return this.request(`/marketing/birthday-calendar${params}`);
  }

  async getInactiveCustomers(days = 30) {
    return this.request(`/marketing/inactive-customers?days=${days}`);
  }

  async getWalkInGuests(date = null) {
    const params = date ? `?date=${date}` : '';
    return this.request(`/marketing/walk-in-guests${params}`);
  }

  async getMarketingCampaigns(status = null, campaignType = null) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (campaignType) params.append('campaign_type', campaignType);
    const query = params.toString();
    return this.request(`/marketing/campaigns${query ? `?${query}` : ''}`);
  }

  async createMarketingCampaign(campaignData) {
    return this.request('/marketing/campaigns', {
      method: 'POST',
      body: campaignData,
    });
  }

  // Phase 2: Travel & VIP Management APIs
  async getVIPTravelDashboard() {
    return this.request('/travel/vip-dashboard');
  }

  async getVIPExperiences(status = null) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/travel/vip-experiences${params}`);
  }

  async createVIPExperience(experienceData) {
    return this.request('/travel/vip-experiences', {
      method: 'POST',
      body: experienceData,
    });
  }

  async getGroupBookings(status = null) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/travel/group-bookings${params}`);
  }

  async createGroupBooking(bookingData) {
    return this.request('/travel/group-bookings', {
      method: 'POST',
      body: bookingData,
    });
  }

  // Phase 3: Staff Management & Advanced Analytics APIs
  async getStaffDashboard() {
    return this.request('/staff/dashboard');
  }

  async getStaffMembers(department = null, search = null) {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (search) params.append('search', search);
    const query = params.toString();
    return this.request(`/staff/members${query ? `?${query}` : ''}`);
  }

  async getTrainingCourses(category = null) {
    const params = category ? `?category=${category}` : '';
    return this.request(`/staff/training/courses${params}`);
  }

  async createTrainingCourse(courseData) {
    return this.request('/staff/training/courses', {
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
    return this.request(`/staff/training/records${query ? `?${query}` : ''}`);
  }

  async createPerformanceReview(reviewData) {
    return this.request('/staff/performance/reviews', {
      method: 'POST',
      body: reviewData,
    });
  }

  async getAdvancedAnalytics(analysisType = null, timePeriod = null) {
    const params = new URLSearchParams();
    if (analysisType) params.append('analysis_type', analysisType);
    if (timePeriod) params.append('time_period', timePeriod);
    const query = params.toString();
    return this.request(`/analytics/advanced${query ? `?${query}` : ''}`);
  }

  async generateAnalyticsReport(analysisType, timePeriod = 'monthly') {
    return this.request('/analytics/generate', {
      method: 'POST',
      body: { analysis_type: analysisType, time_period: timePeriod },
    });
  }

  async getCostOptimization(area = null, status = null) {
    const params = new URLSearchParams();
    if (area) params.append('area', area);
    if (status) params.append('status', status);
    const query = params.toString();
    return this.request(`/optimization/cost-savings${query ? `?${query}` : ''}`);
  }

  async createCostOptimization(optimizationData) {
    return this.request('/optimization/opportunities', {
      method: 'POST',
      body: optimizationData,
    });
  }

  async getPredictiveModels(modelType = null, isProduction = null) {
    const params = new URLSearchParams();
    if (modelType) params.append('model_type', modelType);
    if (isProduction !== null) params.append('is_production', isProduction);
    const query = params.toString();
    return this.request(`/predictive/models${query ? `?${query}` : ''}`);
  }

  async createPredictiveModel(modelData) {
    return this.request('/predictive/models', {
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
    return this.request(`/notifications${query ? `?${query}` : ''}`);
  }

  async createNotification(data) {
    return this.request('/notifications', {
      method: 'POST',
      body: data,
    });
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async getNotificationTemplates(category = null) {
    const params = category ? `?category=${category}` : '';
    return this.request(`/notifications/templates${params}`);
  }

  async createNotificationTemplate(data) {
    return this.request('/notifications/templates', {
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
    return this.request(`/compliance/reports${query ? `?${query}` : ''}`);
  }

  async generateComplianceReport(data) {
    return this.request('/compliance/reports/generate', {
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
    return this.request(`/audit/enhanced${query ? `?${query}` : ''}`);
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
    return this.request(`/integrations${query ? `?${query}` : ''}`);
  }

  async createSystemIntegration(data) {
    return this.request('/integrations', {
      method: 'POST',
      body: data,
    });
  }

  async syncIntegration(id) {
    return this.request(`/integrations/${id}/sync`, {
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
    return this.request(`/analytics/user-activity${query ? `?${query}` : ''}`);
  }

  async getRealTimeEvents(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    const query = searchParams.toString();
    return this.request(`/analytics/real-time-events${query ? `?${query}` : ''}`);
  }

  async createRealTimeEvent(data) {
    return this.request('/analytics/real-time-events', {
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
    return this.request(`/data-retention/policies${query ? `?${query}` : ''}`);
  }

  async createDataRetentionPolicy(data) {
    return this.request('/data-retention/policies', {
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
    return this.request('/health');
  }
}

export default new ApiService();