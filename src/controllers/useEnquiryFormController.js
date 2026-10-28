import { useState } from 'react';
import { enquiryService } from '../services/enquiryService';
import { validateEnquiryData } from '../models/enquiryModel';
import { extractErrorMessage } from '../services/apiService';

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  city: '',
  message: '',
};

/**
 * Controller: Manages public enquiry form submission, validation, and feedback
 */
export const useEnquiryFormController = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    // Model validation
    const validation = validateEnquiryData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: String(formData.phone).trim(),
        city: formData.city.trim(),
        message: formData.message.trim(),
      };

      const response = await enquiryService.submitPublicEnquiry(payload);

      const notice =
        response?.message || 'Your enquiry has been submitted successfully! We will get back to you shortly.';
      setSuccessMessage(notice);
      resetForm();
    } catch (err) {
      const parsed = extractErrorMessage(err);
      setErrorMessage(parsed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    successMessage,
    errorMessage,
    handleFieldChange,
    handleSubmit,
    resetForm,
  };
};

export default useEnquiryFormController;
