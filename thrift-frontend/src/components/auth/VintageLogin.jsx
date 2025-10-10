import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './VintageAuth.css';

const VintageLogin = ({ onLogin, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    
    if (!formData.email) errors.email = true;
    if (!formData.password) errors.password = true;
    
    setFieldErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      onLogin(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="mobile-text-2xl font-vintage font-bold text-vintage-600 text-center mb-6">
          Archive Access
        </h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 mobile-text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={`mobile-input ${fieldErrors.email ? 'border-red-500' : ''}`}
            required
          />

          <div className="password-field-container">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Access Code"
              value={formData.password}
              onChange={handleChange}
              className={`mobile-input ${fieldErrors.password ? 'border-red-500' : ''}`}
              required
            />
            <button
              type="button"
              className="touch-target absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-500 hover:text-vintage-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button type="submit" className="mobile-button mobile-button-primary w-full">
            Enter Archive
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="mobile-text-sm text-gray-600 mb-2">New to the collection?</p>
          <Link
            to="/register"
            className="mobile-button mobile-button-secondary w-full"
          >
            Request Archive Access
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VintageLogin;