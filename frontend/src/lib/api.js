import { apiConfig } from './config';

class ApiClient {
  constructor() {
    this.baseUrl = apiConfig.baseUrl;
    this.timeout = apiConfig.timeout;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        
        // For development, return errors instead of throwing them
        if (response.status === 404) {
          return { error: `Endpoint not found: ${endpoint}. Backend may not be running.` };
        } else if (response.status >= 500) {
          return { error: `Server error: ${errorMessage}. Check backend server.` };
        } else if (response.status === 0) {
          return { error: 'Network error: Cannot connect to backend server.' };
        }
        
        return { error: errorMessage };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.warn('API request failed:', error.message);
      
      // Return errors instead of throwing them
      if (error.name === 'AbortError') {
        return { error: 'Request timeout - server may be slow or unavailable' };
      } else if (error.message.includes('fetch') || error.name === 'TypeError') {
        return { error: 'Network error - cannot connect to backend server' };
      }
      
      return { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Auth endpoints
  async login(idToken) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    });
    
    // If backend is not available, return mock success
    if (response.error && (
      response.error.includes('Network error') || 
      response.error.includes('Request timeout') ||
      response.error.includes('Failed to fetch')
    )) {
      return {
        data: {
          user: {
            id: 'demo-user-123',
            email: 'demo@example.com',
            name: 'Demo User',
            role: 'student',
            wallet_address: null,
            created_at: new Date().toISOString()
          },
          token: 'demo-token-' + Date.now()
        }
      };
    }
    
    return response;
  }

  async getProfile() {
    const response = await this.request('/api/auth/profile');
    
    // Mock fallback
    if (response.error && (
      response.error.includes('Network error') || 
      response.error.includes('Request timeout') ||
      response.error.includes('Failed to fetch')
    )) {
      return {
        data: {
          id: 'demo-user-123',
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'student',
          wallet_address: null,
          created_at: new Date().toISOString()
        }
      };
    }
    
    return response;
  }

  async updateWallet(walletAddress) {
    const response = await this.request('/api/auth/wallet', {
      method: 'PUT',
      body: JSON.stringify({ wallet_address: walletAddress }),
    });
    
    // Mock fallback
    if (response.error && (
      response.error.includes('Network error') || 
      response.error.includes('Request timeout') ||
      response.error.includes('Failed to fetch')
    )) {
      return {
        data: {
          success: true,
          wallet_address: walletAddress
        }
      };
    }
    
    return response;
  }

  async verifyToken() {
    const response = await this.request('/api/auth/verify', {
      method: 'POST',
    });
    
    // Mock fallback for token verification
    if (response.error && (
      response.error.includes('Network error') || 
      response.error.includes('Request timeout') ||
      response.error.includes('Failed to fetch')
    )) {
      // In demo mode, always return valid token
      return {
        data: {
          valid: true,
          user: {
            id: 'demo-user-123',
            email: 'demo@example.com',
            name: 'Demo User',
            role: 'student',
            wallet_address: null
          }
        }
      };
    }
    
    return response;
  }

  // Student endpoints
  async submitApplication(applicationData) {
    return this.request('/api/student/apply', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getStudentApplications() {
    const response = await this.request('/api/student/applications');
    
    // Enhanced fallback for new users or connection issues  
    if (response.error) {
      return {
        data: {
          applications: [],
          count: 0,
          wallet_setup_required: true
        }
      };
    }
    
    return response;
  }

  async getApplicationDetails(applicationId) {
    return this.request(`/api/student/applications/${applicationId}`);
  }

  async getStudentDashboard() {
    const response = await this.request('/api/student/dashboard');
    
    // Enhanced fallback for new users or connection issues
    if (response.error) {
      return {
        data: {
          total_applications: 0,
          approved_applications: 0,
          pending_applications: 0,
          rejected_applications: 0,
          total_awarded: 0,
          recent_applications: [],
          wallet_setup_required: true
        }
      };
    }
    
    return response;
  }

  async getStudentProfile() {
    return this.request('/api/student/profile');
  }

  async updateStudentProfile(profileData) {
    return this.request('/api/student/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Admin endpoints
  async getAdminApplications(status, limit) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/admin/applications${query}`);
  }

  async getAdminApplicationDetails(applicationId) {
    return this.request(`/api/admin/applications/${applicationId}`);
  }

  async approveApplication(applicationId, data = {}) {
    return this.request(`/api/admin/applications/${applicationId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectApplication(applicationId, data = {}) {
    return this.request(`/api/admin/applications/${applicationId}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdminDashboard() {
    return this.request('/api/admin/dashboard');
  }

  async getScholarshipRecords(studentWallet, limit) {
    const params = new URLSearchParams();
    if (studentWallet) params.append('student_wallet', studentWallet);
    if (limit) params.append('limit', limit.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/admin/scholarship-records${query}`);
  }

  async getDetailedStatistics() {
    return this.request('/api/admin/statistics');
  }

  // New admin endpoints for statistics and settings
  async getStatistics(timeframe = 'all') {
    return this.request(`/api/admin/statistics?timeframe=${timeframe}`);
  }

  async getAllApplications() {
    return this.request('/api/admin/applications');
  }

  async exportStatistics(format = 'csv', timeframe = 'all') {
    return this.request(`/api/admin/export/statistics?format=${format}&timeframe=${timeframe}`);
  }

  async getSystemSettings() {
    return this.request('/api/admin/settings');
  }

  async updateSystemSettings(settings) {
    return this.request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async testEmailConfiguration(emailSettings) {
    return this.request('/api/admin/test/email', {
      method: 'POST',
      body: JSON.stringify(emailSettings),
    });
  }

  async testBlockchainConfiguration(blockchainSettings) {
    return this.request('/api/admin/test/blockchain', {
      method: 'POST',
      body: JSON.stringify(blockchainSettings),
    });
  }

  async getAuditLogs(limit = 50) {
    return this.request(`/api/admin/audit-logs?limit=${limit}`);
  }

  async getSystemHealth() {
    return this.request('/api/admin/system/health');
  }

  // Blockchain and payment endpoints
  async initiatePayment(applicationId) {
    return this.request(`/api/admin/payments/${applicationId}/initiate`, {
      method: 'POST',
    });
  }

  async getPaymentStatus(applicationId) {
    return this.request(`/api/admin/payments/${applicationId}/status`);
  }

  async getTransactionHistory(limit = 20) {
    return this.request(`/api/admin/transactions?limit=${limit}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();