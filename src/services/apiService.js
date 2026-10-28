import axios from 'axios';
import { authStorage } from '../models/authModel';

// API base URL from environment or default
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 & 403 handling
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error.response ? error.response.status : null;

//     if (status === 401) {
//       // Clear expired credentials and route to login
//       authStorage.clearAll();
//       if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
//         window.location.href = '/admin/login?sessionExpired=true';
//       }
//     } else if (status === 403) {
//       // 403 indicates permission/role error; do not automatically log out
//       console.warn('Access Forbidden (403): User lacks sufficient privileges.');
//     }

//     return Promise.reject(error);
//   }
// );


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (
      (status === 401 || status === 403) &&
      typeof window !== 'undefined'
    ) {
      authStorage.clearAll();

      if (!window.location.pathname.includes('/admin/login')) {
        window.location.replace(
          '/admin/login?sessionExpired=true'
        );
      }
    }

    return Promise.reject(error);
  }
);



/**
 * Universal error extractor for Axios responses
 */
export const extractErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';

  // Network or CORS issues
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return (
      `Network Error: Unable to communicate with the backend server at ${BASE_URL}. ` +
      `Please ensure Spring Boot is running and that CORS allows requests from this origin.`
    );
  }

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
