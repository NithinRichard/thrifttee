import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import apiService from '../../services/api';

const GuestCheckout = ({ onSuccess, onBackToLogin }) => {
  const { state, actions } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN'
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };

    switch (name) {
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!validateEmail(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;

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

      case 'phone':
        if (!value.trim()) {
          errors.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(value.replace(/\s/g, ''))) {
          errors.phone = 'Please enter a valid 10-digit mobile number';
        } else {
          delete errors.phone;
        }
        break;

      case 'address':
        if (!value.trim()) {
          errors.address = 'Address is required';
        } else if (value.trim().length < 10) {
          errors.address = 'Please enter a complete address';
        } else {
          delete errors.address;
        }
        break;

      case 'city':
        if (!value.trim()) {
          errors.city = 'City is required';
        } else {
          delete errors.city;
        }
        break;

      case 'state':
        if (!value.trim()) {
          errors.state = 'State is required';
        } else {
          delete errors.state;
        }
        break;

      case 'postalCode':
        if (!value.trim()) {
          errors.postalCode = 'Postal code is required';
        } else if (!/^\d{6}$/.test(value)) {
          errors.postalCode = 'Please enter a valid 6-digit postal code';
        } else {
          delete errors.postalCode;
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

  const handleNext = () => {
    const currentFields = getCurrentStepFields();
    let allValid = true;

    currentFields.forEach(field => {
      if (!validateField(field, formData[field])) {
        allValid = false;
      }
    });

    if (allValid) {
      setCurrentStep(prev => Math.min(prev + 1, 2));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getCurrentStepFields = () => {
    switch (currentStep) {
      case 1:
        return ['email', 'firstName', 'lastName', 'phone'];
      case 2:
        return ['address', 'city', 'state', 'postalCode'];
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    // Validate all fields before submission
    const allFields = ['email', 'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'postalCode'];
    let allValid = true;

    allFields.forEach(field => {
      if (!validateField(field, formData[field])) {
        allValid = false;
      }
    });

    if (!allValid) {
      return;
    }

    setIsLoading(true);
    try {
      // Create guest order
      // Build items from the guest cart stored in app state
      const items = (state.cart || []).map((it) => ({
        product: it.productId || it.id,
        quantity: it.quantity || 1,
        // Optional fields (backend will use DB price if product id exists)
        price: it.price,
        title: it.title,
        brand: it.brand,
        size: it.size,
        color: it.color,
      }));

      const guestData = {
        email: formData.email,
        shipping_address: {
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country
        },
        is_guest_checkout: true,
        items,
      };

      const response = await apiService.post('/orders/create_guest_order/', guestData);

      if (response.success) {
        onSuccess(response.order_id, {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          shippingAddress: guestData.shipping_address,
        });
      } else {
        throw new Error(response.message || 'Failed to create guest order');
      }
    } catch (error) {
      console.error('Guest checkout error:', error);
      setFieldErrors({ submit: error.message || 'Failed to process order. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          currentStep >= 1 ? 'bg-vintage-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          1
        </div>
        <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-vintage-600' : 'bg-gray-200'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          currentStep >= 2 ? 'bg-vintage-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          2
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-vintage font-bold text-gray-900 mb-4">Contact Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            name="firstName"
            placeholder="First Name *"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-500 ${
              fieldErrors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
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
            placeholder="Last Name *"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-500 ${
              fieldErrors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            autoComplete="family-name"
          />
          {fieldErrors.lastName && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <input
          type="email"
          name="email"
          placeholder="Email Address *"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-500 ${
            fieldErrors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          autoComplete="email"
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <input
          type="tel"
          name="phone"
          placeholder="Mobile Number *"
          value={formData.phone}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-500 ${
            fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          autoComplete="tel"
        />
        {fieldErrors.phone && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-vintage font-bold text-gray-900 mb-4">Shipping Address</h3>

      <div>
        <textarea
          name="address"
          placeholder="Full Address *"
          value={formData.address}
          onChange={handleInputChange}
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-500 resize-none ${
            fieldErrors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          autoComplete="address-line1"
        />
        {fieldErrors.address && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            name="city"
            placeholder="City *"
            value={formData.city}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-500 ${
              fieldErrors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            autoComplete="address-level2"
          />
          {fieldErrors.city && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.city}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            name="state"
            placeholder="State *"
            value={formData.state}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-500 ${
              fieldErrors.state ? 'border-red-500' : 'border-gray-300'
            }`}
            autoComplete="address-level1"
          />
          {fieldErrors.state && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.state}</p>
          )}
        </div>
      </div>

      <div>
        <input
          type="text"
          name="postalCode"
          placeholder="Postal Code *"
          value={formData.postalCode}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-500 ${
            fieldErrors.postalCode ? 'border-red-500' : 'border-gray-300'
          }`}
          autoComplete="postal-code"
        />
        {fieldErrors.postalCode && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.postalCode}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-vintage font-bold text-gray-900 mb-2">
            Guest Checkout
          </h2>
          <p className="text-gray-600">
            Quick and secure checkout without creating an account
          </p>
        </div>

        {renderStepIndicator()}

        <div className="mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
        </div>

        {fieldErrors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{fieldErrors.submit}</p>
          </div>
        )}

        <div className="flex justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onBackToLogin}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Login Instead
            </button>
          )}

          {currentStep < 2 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-vintage-600 text-white rounded-lg hover:bg-vintage-700 transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-3 bg-vintage-600 text-white rounded-lg hover:bg-vintage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Place Order'}
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-vintage-600 hover:text-vintage-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-vintage-600 hover:text-vintage-700">
              Privacy Policy
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default GuestCheckout;
