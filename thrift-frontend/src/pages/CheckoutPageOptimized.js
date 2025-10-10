import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';

const CheckoutPageOptimized = () => {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    email: state.user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: ''
  });

  useEffect(() => {
    if (state.cart.length === 0) navigate('/products');
    initializeCheckout();
  }, []);

  const initializeCheckout = async () => {
    if (!state.isAuthenticated) return;
    try {
      const response = await apiService.post('/orders/create_razorpay_order/', {});
      setOrderData(response);
    } catch (error) {
      console.error('Checkout init error:', error);
    }
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      newErrors.email = 'Valid email required';
    } else if (name === 'phone' && !/^\d{10}$/.test(value.replace(/\D/g, ''))) {
      newErrors.phone = '10-digit phone number required';
    } else if (name === 'postal_code' && !/^\d{6}$/.test(value)) {
      newErrors.postal_code = '6-digit PIN code required';
    } else {
      delete newErrors[name];
    }
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  const handlePayment = async () => {
    if (!orderData) return;
    setLoading(true);

    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'ThriftTees',
      order_id: orderData.razorpay_order_id,
      handler: async (response) => {
        try {
          const verificationResponse = await apiService.post('/orders/verify_payment/', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verificationResponse?.status === 'success') {
            actions.clearCartLocal();
            alert('Payment successful! Order confirmation sent to your email.');
            setTimeout(() => navigate('/profile'), 1000);
          }
        } catch (error) {
          alert('Payment verification failed. Please contact support.');
        }
      },
      prefill: { email: formData.email, contact: formData.phone },
      theme: { color: '#8B5A3C' }
    };

    if (window.Razorpay) {
      new window.Razorpay(options).open();
    }
    setLoading(false);
  };

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const shipping = subtotal >= 1000 ? 0 : 50;
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header - Logo Only */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <button onClick={() => navigate('/cart')} className="text-2xl font-vintage font-bold text-gray-900">
            ThriftTees
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1: Contact */}
            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg lg:text-xl font-bold">1. Contact Information</h2>
                {currentStep > 1 && <button onClick={() => setCurrentStep(1)} className="text-sm text-vintage-600">Edit</button>}
              </div>
              {currentStep >= 1 && (
                <div className="space-y-3">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="email"
                    className={`w-full px-4 py-3 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone (10 digits)"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="tel"
                    className={`w-full px-4 py-3 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                  {currentStep === 1 && (
                    <button
                      onClick={() => !errors.email && !errors.phone && formData.email && formData.phone && setCurrentStep(2)}
                      disabled={!formData.email || !formData.phone || errors.email || errors.phone}
                      className="w-full bg-vintage-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                    >
                      Continue to Shipping
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Shipping */}
            {currentStep >= 2 && (
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg lg:text-xl font-bold">2. Shipping Address</h2>
                  {currentStep > 2 && <button onClick={() => setCurrentStep(2)} className="text-sm text-vintage-600">Edit</button>}
                </div>
                {currentStep >= 2 && (
                  <div className="space-y-3">
                    <textarea
                      name="address"
                      placeholder="Street Address"
                      value={formData.address}
                      onChange={handleChange}
                      autoComplete="street-address"
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        autoComplete="address-level2"
                        className="px-4 py-3 border border-gray-300 rounded-lg"
                      />
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        autoComplete="address-level1"
                        className="px-4 py-3 border border-gray-300 rounded-lg"
                      >
                        <option value="">State</option>
                        <option value="KL">Kerala</option>
                        <option value="MH">Maharashtra</option>
                        <option value="KA">Karnataka</option>
                        <option value="TN">Tamil Nadu</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      name="postal_code"
                      placeholder="PIN Code (6 digits)"
                      value={formData.postal_code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="postal-code"
                      className={`w-full px-4 py-3 border rounded-lg ${errors.postal_code ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.postal_code && <p className="text-sm text-red-600">{errors.postal_code}</p>}
                    {currentStep === 2 && (
                      <button
                        onClick={() => formData.address && formData.city && formData.state && formData.postal_code && !errors.postal_code && setCurrentStep(3)}
                        disabled={!formData.address || !formData.city || !formData.state || !formData.postal_code || errors.postal_code}
                        className="w-full bg-vintage-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                      >
                        Continue to Payment
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep >= 3 && (
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold mb-4">3. Payment</h2>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">₹</div>
                    <div>
                      <p className="font-semibold">Razorpay Secure Checkout</p>
                      <p className="text-sm text-gray-600">UPI, Cards, Net Banking, Wallets</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={loading || !orderData}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
                </button>
                <p className="text-center text-sm text-gray-600 mt-3">🔒 Secure encrypted payment</p>
              </div>
            )}
          </div>

          {/* Sticky Order Summary - 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 lg:p-6 lg:sticky lg:top-20">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {state.cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <p className="text-xs text-gray-600">Size: {item.size} × {item.quantity}</p>
                      <p className="text-sm font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax (18%)</span><span>₹{tax.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span><span className="text-vintage-600">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPageOptimized;
