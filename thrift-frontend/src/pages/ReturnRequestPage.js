import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';

const ReturnRequestPage = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    reason: '',
    type: 'return',
    comments: '',
    images: []
  });

  const returnReasons = [
    'Item doesn\'t fit',
    'Item condition not as described',
    'Wrong item received',
    'Changed my mind',
    'Item damaged during shipping',
    'Quality not as expected',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await apiService.post('/orders/return-request/', formData);
      alert('Return request submitted successfully! We\'ll email you a return label within 24 hours.');
      navigate('/profile');
    } catch (error) {
      alert('Failed to submit return request. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-4xl font-vintage font-bold text-gray-900 mb-4 text-center">
            Return or Exchange
          </h1>
          <p className="text-gray-600 text-center mb-8">
            We accept returns within 7 days of delivery
          </p>

          {/* Return Policy Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">Return Policy</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ 7-day return window from delivery date</li>
              <li>✓ Items must be unworn with tags attached</li>
              <li>✓ Original packaging preferred</li>
              <li>✓ Free return shipping label provided</li>
              <li>✓ Refund processed within 5-7 business days</li>
            </ul>
          </div>

          {/* Return Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            {/* Order ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Order Number *
              </label>
              <input
                type="text"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                placeholder="e.g., ORD-12345"
                className="w-full input-field"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Find this in your order confirmation email or profile
              </p>
            </div>

            {/* Return or Exchange */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Request Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-vintage-600 transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value="return"
                    checked={formData.type === 'return'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Return</div>
                    <div className="text-xs text-gray-600">Get a refund</div>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-vintage-600 transition-colors">
                  <input
                    type="radio"
                    name="type"
                    value="exchange"
                    checked={formData.type === 'exchange'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Exchange</div>
                    <div className="text-xs text-gray-600">Different size/item</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for {formData.type === 'return' ? 'Return' : 'Exchange'} *
              </label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full input-field"
                required
              >
                <option value="">Select a reason</option>
                {returnReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            {/* Additional Comments */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Details
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows={4}
                placeholder="Please provide any additional information that will help us process your request..."
                className="w-full input-field"
              />
            </div>

            {/* Photo Upload Note */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">📸 Photo Documentation</h4>
              <p className="text-sm text-gray-600">
                If your item is damaged or not as described, please email photos to <a href="mailto:returns@thriftee.com" className="text-vintage-600 underline">returns@thriftee.com</a> with your order number.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? 'Submitting...' : `Submit ${formData.type === 'return' ? 'Return' : 'Exchange'} Request`}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By submitting, you agree to our <a href="/return-policy" className="text-vintage-600 underline">Return Policy</a>
            </p>
          </form>

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-3">Need help with your return?</p>
            <a href="mailto:support@thriftee.com" className="text-vintage-600 font-semibold hover:text-vintage-700">
              Contact Support →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReturnRequestPage;
