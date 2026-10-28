import { apiClient } from './apiService';
import { authStorage } from '../models/authModel';

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Admin Login: POST /api/admin/auth/login
   */
  async login({ email, password }) {
    const response = await apiClient.post('/api/admin/auth/login', { email, password });
    const data = response.data;

    // Extract access token
    const token = data?.accessToken || data?.token || (typeof data === 'string' ? data : null);
    if (token) {
      authStorage.setToken(token);
    }

    // Extract admin profile details
    if (data && typeof data === 'object') {
      authStorage.setAdmin({
        adminId: data.adminId,
        name: data.name || 'Admin',
        email: data.email || email,
        role: data.role || 'ADMIN',
      });
    } else {
      authStorage.setAdmin({
        name: 'Admin',
        email,
        role: 'ADMIN',
      });
    }

    return data;
  },

  /**
   * Admin Logout
   */
  logout() {
    authStorage.clearAll(); 
    window.location.href = '/admin/login';
  },

  /**
   * Check login state
   */
  isAuthenticated() {
    return authStorage.isAuthenticated();
  },

  /**
   * Get current admin info
   */
  getAdminProfile() {
    return authStorage.getAdmin();
  },
};

export default authService;
