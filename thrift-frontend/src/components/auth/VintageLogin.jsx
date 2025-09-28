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
    <div className="auth-workshop-surface">
      <div className="archivist-entry-card">
        <h1 className="auth-title">Archive Access</h1>
        
        {error && (
          <div className="stamped-notification">
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
            className={`signed-ledger-entry ${fieldErrors.email ? 'error' : ''}`}
            required
          />

          <div className="password-field-container">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Access Code"
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

          <button type="submit" className="official-seal-button">
            Enter Archive
          </button>
        </form>

        <div className="auth-switch-container">
          <p className="auth-switch-text">New to the collection?</p>
          <Link to="/register" className="filing-tab-link">
            Request Archive Access
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VintageLogin;