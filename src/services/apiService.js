import axios from 'axios';
import { authStorage } from '../models/authModel';

// ========================================
// API CONFIGURATION
// ========================================

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Main API client
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Separate Axios client for refresh API
// This prevents interceptor recursion.
const refreshClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Prevent multiple simultaneous refresh requests
let refreshPromise = null;

// ========================================
// REQUEST INTERCEPTOR
// Attach access token to every request
// ========================================

apiClient.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ========================================
// RESPONSE INTERCEPTOR
// Handle expired access tokens
// ========================================

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Do not refresh on permission errors
    if (status === 403) {
      console.warn(
        'Access Forbidden (403): User lacks sufficient privileges.'
      );

      return Promise.reject(error);
    }

    // Only handle 401 responses
    if (
      status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/api/admin/auth/login') ||
      originalRequest.url?.includes('/api/admin/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // Prevent infinite retry
    originalRequest._retry = true;

    try {
      // Reuse an existing refresh operation
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      // Wait for new access token
      const newAccessToken = await refreshPromise;

      // Update authorization header
      originalRequest.headers = originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      // Retry original failed request
      return apiClient(originalRequest);

    } catch (refreshError) {

      // Refresh failed: clear admin session
      authStorage.clearAll();

      // Redirect to login
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/admin/login')
      ) {
        window.location.replace(
          '/admin/login?sessionExpired=true'
        );
      }

      return Promise.reject(refreshError);
    }
  }
);

// ========================================
// REFRESH ACCESS TOKEN
// ========================================

async function refreshAccessToken() {

  const refreshToken = authStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error('Refresh token not found.');
  }

  const response = await refreshClient.post(
  '/api/admin/auth/refresh',
  {},
  { 
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  }
);

  const data = response.data;

  if (!data?.accessToken) {
    throw new Error('New access token not received.');
  }

  // Save new access token
  authStorage.setToken(data.accessToken);

  // Save rotated refresh token if returned
  if (data.refreshToken) {
    authStorage.setRefreshToken(data.refreshToken);
  }

  return data.accessToken;
}

/**
 * Universal error extractor for Axios responses
 */
export const extractErrorMessage = (error) => {
  if (!error) {
    return 'An unexpected error occurred.';
  }

  // Network or CORS issues
  if (
    error.code === 'ERR_NETWORK' ||
    error.message === 'Network Error'
  ) {
    return (
      `Network Error: Unable to communicate with the backend server at ${BASE_URL}. ` +
      'Please ensure Spring Boot is running and that CORS allows requests from this origin.'
    );
  }

  // Request timeout
  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please verify that the backend is responding.';
  }

  if (error.response) {
    const { status, data } = error.response;

    // Plain text response
    if (typeof data === 'string' && data.trim()) {
      return `[Status ${status}] ${data}`;
    }

    // JSON response
    if (data && typeof data === 'object') {
      const msg =
        data.message ||
        data.error ||
        data.detail ||
        (data.errors ? JSON.stringify(data.errors) : null);

      if (msg) {
        return `[Status ${status}] ${msg}`;
      }
    }

    // Status code fallbacks
    switch (status) {
      case 400:
        return '[Status 400] Bad Request. Please check your submitted values.';

      case 401:
        return '[Status 401] Unauthorized. Invalid credentials or expired session.';

      case 403:
        return '[Status 403] Access Forbidden. You do not have permission for this resource.';

      case 404:
        return '[Status 404] Resource or endpoint not found on the backend.';

      case 409:
        return '[Status 409] Conflict detected on the server.';

      case 500:
        return '[Status 500] Internal Server Error. Please inspect backend logs.';

      default:
        return `Request failed with HTTP status ${status}.`;
    }
  }

  return error.message || 'An unknown error occurred.';
};

export default apiClient;
