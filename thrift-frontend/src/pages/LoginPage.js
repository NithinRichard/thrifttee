
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';
import VintageLogin from '../components/auth/VintageLogin';

const LoginPage = () => {
  const { actions } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  const handleLogin = async (formData) => {
    try {
      actions.setLoading(true);
      const response = await apiService.login(formData);
      const token = response.token || response.access_token || localStorage.getItem('authToken');
      await actions.login(response.user, token);

      const redirectTo = location.state?.redirectTo || '/profile';
      navigate(redirectTo);
    } catch (error) {
      setError('Invalid credentials. Please try again.');
    } finally {
      actions.setLoading(false);
    }
  };

  return <VintageLogin onLogin={handleLogin} error={error} />;
};

export default LoginPage;
