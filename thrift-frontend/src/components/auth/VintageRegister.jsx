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

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    
    if (!formData.firstName) errors.firstName = true;
    if (!formData.lastName) errors.lastName = true;
    if (!formData.email) errors.email = true;
    if (!formData.password) errors.password = true;
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = true;
    
    setFieldErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      onRegister(formData);
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
    <div className="auth-workshop-surface">
      <div className="archivist-entry-card">
        <h1 className="auth-title">Archive Registration</h1>
        
        {error && (
          <div className="stamped-notification">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className={`signed-ledger-entry ${fieldErrors.firstName ? 'error' : ''}`}
            required
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className={`signed-ledger-entry ${fieldErrors.lastName ? 'error' : ''}`}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={`signed-ledger-entry ${fieldErrors.email ? 'error' : ''}`}
            required
          />

          <div className="password-field-container">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create Access Code"
              value={formData.password}
              onChange={handleChange}
              className={`signed-ledger-entry ${fieldErrors.password ? 'error' : ''}`}
              required
            />
            <button
              type="button"
              className="magnifying-glass-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🔍' : '🔐'}
            </button>
          </div>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Access Code"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`signed-ledger-entry ${fieldErrors.confirmPassword ? 'error' : ''}`}
            required
          />

          <button type="submit" className="official-seal-button">
            Submit Application
          </button>
        </form>

        <div className="auth-switch-container">
          <p className="auth-switch-text">Already have archive access?</p>
          <Link to="/login" className="filing-tab-link">
            Enter Archive
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VintageRegister;