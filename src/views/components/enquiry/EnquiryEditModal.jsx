import React, { useState, useEffect } from 'react';
import {
  getAllowedNextStatuses,
  STATUS_META,
  validateEnquiryData,
} from '../../../models/enquiryModel';

export default function EnquiryEditModal({
  isOpen,
  enquiry,
  isLoading,
  onSave,
  onClose,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    message: '',
    status: 'NEW',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (enquiry) {
      setFormData({
        name: enquiry.name || '',
        email: enquiry.email || '',
        phone: enquiry.phone || '',
        city: enquiry.city || '',
        message: enquiry.message || '',
        status: (enquiry.status || 'NEW').toUpperCase(),
      });
      setErrors({});
    }
  }, [enquiry]);

  if (!isOpen || !enquiry) return null;

  const currentStatus = (enquiry.status || 'NEW').toUpperCase();
  const allowedStatuses = getAllowedNextStatuses(currentStatus);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const validation = validateEnquiryData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const resultErrors = await onSave(enquiry.id, formData);
    if (resultErrors) {
      setErrors(resultErrors);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card modal-card-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h3 className="modal-title">Edit Enquiry #{enquiry.id}</h3>
            <span className="modal-subtitle">
              Update enquiry information and forward status progression
            </span>
          </div>
          <button
            type="button"
            className="modal-close-icon"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {errors.form && (
          <div className="alert alert-danger" role="alert">
            <span className="alert-icon">⚠️</span>
            <div>{errors.form}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body-scroll">
            <div className="form-grid-2">
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="edit-name" className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="edit-email" className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>
            </div>

            <div className="form-grid-2">
              {/* Phone */}
              <div className="form-group">
                <label htmlFor="edit-phone" className="form-label">
                  Phone (10 Digits) <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="edit-phone"
                  name="phone"
                  maxLength={10}
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <span className="field-error">{errors.phone}</span>
                )}
              </div>

              {/* City */}
              <div className="form-group">
                <label htmlFor="edit-city" className="form-label">
                  City <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="edit-city"
                  name="city"
                  className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                  value={formData.city}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>
            </div>

            {/* Status (One-Way Progression) */}
            <div className="form-group">
              <label htmlFor="edit-status" className="form-label">
                Workflow Status <span className="required">*</span>
              </label>
              <select
                id="edit-status"
                name="status"
                className={`form-control ${errors.status ? 'is-invalid' : ''}`}
                value={formData.status}
                onChange={handleChange}
                disabled={isLoading}
              >
                {allowedStatuses.map((st) => (
                  <option key={st} value={st}>
                    {STATUS_META[st]?.label || st}
                  </option>
                ))}
              </select>
              <span className="field-hint">
                Note: Status can only advance forward ({allowedStatuses.join(' → ')}).
              </span>
              {errors.status && (
                <span className="field-error">{errors.status}</span>
              )}
            </div>

            {/* Enquiry Message */}
            <div className="form-group">
              <label htmlFor="edit-message" className="form-label">
                Enquiry Message <span className="required">*</span>
              </label>
              <textarea
                id="edit-message"
                name="message"
                rows={3}
                className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                value={formData.message}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.message && (
                <span className="field-error">{errors.message}</span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="btn-loading-content">
                  <span className="spinner-inline"></span> Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
