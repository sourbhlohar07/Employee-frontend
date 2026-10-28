import React from 'react';
import { Link } from 'react-router-dom';
import useAuthController from '../../controllers/useAuthController';

export default function AdminLoginPage() {
  const {
    email,
    password,
    errors,
    isLoading,
    errorMessage,
    sessionNotice,
    handleInputChange,
    handleLogin,
  } = useAuthController();

  return (
    <div className="page-container login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">🔐</div>
          <h1 className="login-title">Admin Portal</h1>
          <p className="login-subtitle">Sign in to manage employee enquiries</p>
        </div>

        {/* Session Notice */}
        {sessionNotice && (
          <div className="alert alert-warning" role="alert">
            <span className="alert-icon">ℹ️</span>
            <div>{sessionNotice}</div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            <span className="alert-icon">⚠️</span>
            <div>
              <strong>Authentication Failed:</strong> {errorMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="admin-email" className="form-label">
              Admin Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="admin-email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="e.g. admin@example.com"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="admin-password" className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              id="admin-password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Enter your admin password"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="btn-loading-content">
                  <span className="spinner-inline"></span> Authenticating...
                </span>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </div>
        </form>

        <div className="form-footer-note">
          <Link to="/" className="link-secondary">
            &larr; Back to Public Enquiry Form
          </Link>
        </div>
      </div>
    </div>
  );
}
