
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';

const RegisterPage = () => {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      actions.setLoading(true);
      await apiService.register(data);
      navigate('/login');
    } catch (error) {
      actions.setError('Failed to register. Please try again.');
    } finally {
      actions.setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg"
      >
        <h1 className="text-4xl font-vintage font-bold text-gray-900 mb-8 text-center">
          Create Account
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="label">Full Name</label>
            <input
              {...register('full_name', { required: true })}
              className="input-field"
            />
            {errors.full_name && <span className="error-message">This field is required</span>}
          </div>
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
              {...register('password', { required: true, minLength: 8 })}
              className="input-field"
            />
            {errors.password && <span className="error-message">Password must be at least 8 characters</span>}
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword', { 
                required: true, 
                validate: value => value === password || "Passwords do not match"
              })}
              className="input-field"
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
          </div>
          <button
            type="submit"
            className="btn-primary w-full text-lg py-3"
            disabled={state.loading}
          >
            {state.loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-vintage-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
