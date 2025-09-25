
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';

const LoginPage = () => {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      actions.setLoading(true);
      const response = await apiService.login(data);
      const token = response.token || response.access_token || localStorage.getItem('authToken');
      await actions.login(response.user, token);

      // Check if there's a redirect path
      const redirectTo = location.state?.redirectTo || '/profile';
      const message = location.state?.message;

      navigate(redirectTo);
    } catch (error) {
      actions.setError('Invalid credentials. Please try again.');
    } finally {
      actions.setLoading(false);
    }
  };

  const message = location.state?.message;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg"
      >
        <h1 className="text-4xl font-vintage font-bold text-gray-900 mb-8 text-center">
          Login
        </h1>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {state.error}
          </div>
        )}

        {state.success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {state.success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              {...register('email', { required: true, pattern: /\S+@\S+\.\S+/ })}
              className="input-field"
            />
            {errors.email && <span className="error-message">Please enter a valid email</span>}
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              {...register('password', { required: true })}
              className="input-field"
            />
            {errors.password && <span className="error-message">This field is required</span>}
          </div>
          <button
            type="submit"
            className="btn-primary w-full text-lg py-3"
            disabled={state.loading}
          >
            {state.loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-vintage-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
