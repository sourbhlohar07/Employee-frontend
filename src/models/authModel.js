/**
 * Auth Model & Session Management
 */

export const STORAGE_KEYS = {
  TOKEN: 'employee_enquiry_jwt_token',
  ADMIN: 'employee_enquiry_admin_user',
};

/**
 * Validates admin login input credentials
 */
export const validateLoginCredentials = ({ email, password }) => {
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Storage helpers for token and admin details
 */
export const authStorage = {
  getToken: () => localStorage.getItem(STORAGE_KEYS.TOKEN) || '',
  setToken: (token) => {
    if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },
  clearToken: () => localStorage.removeItem(STORAGE_KEYS.TOKEN),

  getAdmin: () => {
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },
  setAdmin: (admin) => {
    if (admin) localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(admin));
  },
  clearAdmin: () => localStorage.removeItem(STORAGE_KEYS.ADMIN),

  isAuthenticated: () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return Boolean(token && token.trim().length > 0);
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN);
  },
};
