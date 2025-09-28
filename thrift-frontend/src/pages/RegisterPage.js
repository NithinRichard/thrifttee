
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
        password: formData.password
      };
      await apiService.register(registerData);
      navigate('/login');
    } catch (error) {
      setError('Failed to register. Please try again.');
    } finally {
      actions.setLoading(false);
    }
  };

  return <VintageRegister onRegister={handleRegister} error={error} />;
};

export default RegisterPage;
