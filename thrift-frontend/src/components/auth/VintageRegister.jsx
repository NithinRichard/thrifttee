import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './VintageAuth.css';

const VintageRegister = ({ onRegister, error }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };

    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          errors.firstName = 'First name is required';
        } else if (value.trim().length < 2) {
          errors.firstName = 'First name must be at least 2 characters';
        } else {
          delete errors.firstName;
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          errors.lastName = 'Last name is required';
        } else if (value.trim().length < 2) {
          errors.lastName = 'Last name must be at least 2 characters';
        } else {
          delete errors.lastName;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;

      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.password = 'Password must contain uppercase, lowercase, and number';
        } else {
          delete errors.password;
        }

        // Also validate confirm password if it exists
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          delete errors.confirmPassword;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const errors = {};
    Object.keys(formData).forEach(key => {
      if (!validateField(key, formData[key])) {
        errors[key] = fieldErrors[key];
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onRegister(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time validation
    setTimeout(() => validateField(name, value), 100);
  };

  const getFieldClassName = (fieldName) => {
    const baseClass = 'mobile-input';
    const errorClass = fieldErrors[fieldName] ? 'border-red-500 focus:ring-red-500' : '';
    return `${baseClass} ${errorClass}`.trim();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="mobile-text-2xl font-vintage font-bold text-vintage-600 text-center mb-6">
          Archive Registration
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 mobile-text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className={getFieldClassName('firstName')}
                disabled={isSubmitting}
                autoComplete="given-name"
              />
              {fieldErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className={getFieldClassName('lastName')}
                disabled={isSubmitting}
                autoComplete="family-name"
              />
              {fieldErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={getFieldClassName('email')}
                disabled={isSubmitting}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <div className="password-field-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create Access Code"
                  value={formData.password}
                  onChange={handleChange}
                  className={getFieldClassName('password')}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="touch-target absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-500 hover:text-vintage-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Access Code"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={getFieldClassName('confirmPassword')}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="mobile-button mobile-button-primary w-full mt-6"
            disabled={isSubmitting || Object.keys(fieldErrors).length > 0}
          >
            {isSubmitting ? 'Creating Account...' : 'Submit Application'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="mobile-text-sm text-gray-600 mb-2">Already have archive access?</p>
          <Link
            to="/login"
            className="mobile-button mobile-button-secondary w-full"
          >
            Enter Archive
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VintageRegister;