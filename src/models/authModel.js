
/**
 * Auth Model & Session Management
 */

export const STORAGE_KEYS = {
  TOKEN: 'employee_enquiry_jwt_token',
  REFRESH_TOKEN: 'employee_enquiry_refresh_token',
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

  // ==============================
  // ACCESS TOKEN
  // ==============================

  getToken: () =>
    localStorage.getItem(STORAGE_KEYS.TOKEN) || '',

  setToken: (token) => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
  },

  clearToken: () =>
    localStorage.removeItem(STORAGE_KEYS.TOKEN),

  // ==============================
  // REFRESH TOKEN
  // ==============================

  getRefreshToken: () =>
    localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || '',

  setRefreshToken: (token) => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    }
  },

  clearRefreshToken: () =>
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),

  // ==============================
  // ADMIN PROFILE
  // ==============================

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
    if (admin) {
      localStorage.setItem(
        STORAGE_KEYS.ADMIN,
        JSON.stringify(admin)
      );
    }
  },

  clearAdmin: () =>
    localStorage.removeItem(STORAGE_KEYS.ADMIN),

  // ==============================
  // AUTHENTICATION STATUS
  // ==============================

  isAuthenticated: () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    return Boolean(token && token.trim().length > 0);
  },

  // ==============================
  // CLEAR COMPLETE SESSION
  // ==============================

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN);
  },
};
