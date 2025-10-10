
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';
import VintageRegister from '../components/auth/VintageRegister';

const RegisterPage = () => {
  const { actions } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleRegister = async (formData) => {
    try {
      actions.setLoading(true);
      const registerData = {
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        username: formData.username || formData.email?.split('@')[0],
      };
      await apiService.register(registerData);
      navigate('/login');
    } catch (error) {
      // Prefer backend field errors if available
      const data = error?.response?.data;
      if (data && typeof data === 'object') {
        try {
          // DRF typically returns {field: ["message"]}
          const messages = Object.entries(data).flatMap(([field, msgs]) => {
            const arr = Array.isArray(msgs) ? msgs : [msgs];
            return arr.map(m => (typeof m === 'string' ? m : JSON.stringify(m)));
          });
          if (messages.length) {
            setError(messages.join(' \n '));
            return;
          }
        } catch (_) {
          // fall-through to generic message
        }
      }
      setError(error?.message || 'Failed to register. Please try again.');
    } finally {
      actions.setLoading(false);
    }
  };

  return <VintageRegister onRegister={handleRegister} error={error} />;
};

export default RegisterPage;
