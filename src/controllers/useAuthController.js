import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { validateLoginCredentials } from '../models/authModel';
import { extractErrorMessage } from '../services/apiService';

/**
 * Controller: Handles admin authentication logic and session state
 */
export const useAuthController = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionNotice, setSessionNotice] = useState('');

  // Target route after successful authentication
  const destination = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    // If already authenticated, redirect directly to dashboard
    if (authService.isAuthenticated()) {
      navigate('/admin/dashboard', { replace: true });
    }

    // Check if redirected due to session expiration
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('sessionExpired') === 'true') {
      setSessionNotice('Your session has expired. Please log in again.');
    }
  }, [navigate, location]);

  const handleInputChange = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);

    // Clear validation error when user begins typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSessionNotice('');

    // Model validation
    const validation = validateLoginCredentials({ email, password });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      await authService.login({
        email: email.trim(),
        password,
      });

      // Navigate to destination
      navigate(destination, { replace: true });
    } catch (err) {
      const parsed = extractErrorMessage(err);
      setErrorMessage(parsed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login');
  };

  return {
    email,
    password,
    errors,
    isLoading,
    errorMessage,
    sessionNotice,
    isAuthenticated: authService.isAuthenticated(),
    adminProfile: authService.getAdminProfile(),
    handleInputChange,
    handleLogin,
    handleLogout,
  };
};

export default useAuthController;
