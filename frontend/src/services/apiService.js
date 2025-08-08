const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class ApiService {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}/api${endpoint}`;
    
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

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();