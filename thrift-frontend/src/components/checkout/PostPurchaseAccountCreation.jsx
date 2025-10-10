import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const PostPurchaseAccountCreation = ({ guestData, onAccountCreated, onSkip }) => {
  const { actions } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };

    switch (name) {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time validation
    setTimeout(() => validateField(name, value), 100);
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

    setIsLoading(true);
    try {
      // Create account with guest data
      const accountData = {
        email: guestData.email,
        password: formData.password,
        first_name: guestData.firstName,
        last_name: guestData.lastName,
        phone: guestData.phone,
        shipping_address: guestData.shippingAddress,
        guest_order_id: guestData.orderId
      };

      // This would typically call an API to create the account
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Account created successfully
      onAccountCreated(accountData);

    } catch (error) {
      console.error('Account creation error:', error);
      setFieldErrors({ submit: 'Failed to create account. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-vintage font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h2>
          <p className="text-gray-600">
            Your order #{guestData.orderId} has been placed successfully.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Order confirmation sent to {guestData.email}</li>
            <li>• Track your order status anytime</li>
            <li>• Get faster checkout on future orders</li>
          </ul>
        </div>

        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className="text-lg font-vintage font-bold text-gray-900 mb-4 text-center">
            Create Your Account
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            Save your details for faster checkout and order tracking
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                name="password"
                placeholder="Create Password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-500 ${
                  fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                autoComplete="new-password"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-500 ${
                  fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {fieldErrors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{fieldErrors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || Object.keys(fieldErrors).length > 0}
              className="w-full bg-vintage-600 text-white py-3 rounded-lg hover:bg-vintage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating Account...' : 'Create Account & Continue'}
            </button>
          </form>
        </div>

        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-vintage-600 hover:text-vintage-700 font-medium text-sm underline"
          >
            Skip for now → Continue shopping
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>You can create an account anytime from your order confirmation email</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PostPurchaseAccountCreation;
