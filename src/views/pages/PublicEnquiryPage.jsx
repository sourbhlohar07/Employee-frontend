import React from 'react';
import { Link } from 'react-router-dom';
import useEnquiryFormController from '../../controllers/useEnquiryFormController';

export default function PublicEnquiryPage() {
  const {
    formData,
    errors,
    isSubmitting,
    successMessage,
    errorMessage,
    handleFieldChange,
    handleSubmit,
  } = useEnquiryFormController();

  return (
    <div className="page-container enquiry-page">
      <div className="form-card">
        <div className="form-card-header">
          <h1 className="form-title">Submit Employee Enquiry</h1>
          <p className="form-subtitle">
            Have a question or request? Complete the details below and our team will get back to you.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="alert alert-success" role="alert">
            <span className="alert-icon">✓</span>
            <div>
              <strong>Success!</strong>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            <span className="alert-icon">⚠️</span>
            <div>
              <strong>Submission Failed:</strong> {errorMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              disabled={isSubmitting}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="e.g. rahul@example.com"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              disabled={isSubmitting}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              maxLength={10}
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              placeholder="e.g. 9876543210 (10 digits starting with 6-9)"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              disabled={isSubmitting}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          {/* City */}
          <div className="form-group">
            <label htmlFor="city" className="form-label">
              City <span className="required">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              className={`form-control ${errors.city ? 'is-invalid' : ''}`}
              placeholder="e.g. Indore"
              value={formData.city}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              disabled={isSubmitting}
            />
            {errors.city && <span className="field-error">{errors.city}</span>}
          </div>

          {/* Enquiry Message */}
          <div className="form-group">
            <label htmlFor="message" className="form-label">
              Enquiry Message <span className="required">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className={`form-control ${errors.message ? 'is-invalid' : ''}`}
              placeholder="Write your enquiry message here..."
              value={formData.message}
              onChange={(e) => handleFieldChange('message', e.target.value)}
              disabled={isSubmitting}
            />
            {errors.message && <span className="field-error">{errors.message}</span>}
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="btn-loading-content">
                  <span className="spinner-inline"></span> Submitting Enquiry...
                </span>
              ) : (
                'Submit Enquiry'
              )}
            </button>
          </div>
        </form>

        <div className="form-footer-note">
          <span>Are you an administrator?</span>{' '}
          <Link to="/admin/login" className="link-primary">
            Admin Login &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
