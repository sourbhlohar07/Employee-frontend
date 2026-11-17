
import { apiClient } from './apiService';
import { authStorage } from '../models/authModel';

/**
 * Authentication Service
 */
export const authService = {

  /**
   * Admin Login
   * POST /api/admin/auth/login
   */
  async login({ email, password }) {

    const response = await apiClient.post(
      '/api/admin/auth/login',
      {
        email,
        password,
      }
    );

    const data = response.data;

    // Extract access token
    const accessToken =
      data?.accessToken ||
      data?.token ||
      (typeof data === 'string' ? data : null);

    // Extract refresh token
    const refreshToken = data?.refreshToken;

    if (!accessToken) {
      throw new Error('Access token not received from server.');
    }

    // Clear any previous session
    authStorage.clearAll();

    // Save access token
    authStorage.setToken(accessToken);

    // Save refresh token
    if (refreshToken) {
      authStorage.setRefreshToken(refreshToken);
    }

    // Save admin profile
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
   * Get current admin information
   */
  getAdminProfile() {
    return authStorage.getAdmin();
  },
};

export default authService;

