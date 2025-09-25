
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';

const CheckoutPage = () => {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    if (state.cart.length === 0) {
      navigate('/products');
      return;
    }

    initializeCheckout();
  }, [state.isAuthenticated, state.cart, navigate]);

  const initializeCheckout = async () => {
    try {
      setLoading(true);
      const response = await apiService.post('/orders/create_razorpay_order/', {});
      setOrderData(response);
    } catch (error) {
      setPaymentError('Failed to initialize payment. Please try again.');
      console.error('Checkout initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!orderData) return;

    try {
      setLoading(true);

      // Razorpay checkout options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ThriftTees',
        description: 'Payment for your order',
        order_id: orderData.razorpay_order_id,
        handler: async (response) => {
          try {
            // Verify payment
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            const verificationResponse = await apiService.post('/orders/verify_payment/', verificationData);

            if (verificationResponse.status === 'success') {
              actions.setSuccess('Payment successful! Your order is being processed.');
              navigate('/profile');
            } else {
              setPaymentError('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            setPaymentError('Payment verification failed. Please try again.');
            console.error('Payment verification error:', error);
          }
        },
        prefill: {
          name: `${state.user?.first_name} ${state.user?.last_name}`.trim() || state.user?.username,
          email: state.user?.email,
        },
        theme: {
          color: '#8B5A3C', // Vintage brown color
        },
        modal: {
          ondismiss: () => {
            setPaymentError('Payment cancelled by user.');
          },
        },
      };

      // Check if Razorpay is loaded
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setPaymentError('Payment gateway not loaded. Please refresh and try again.');
      }

    } catch (error) {
      setPaymentError('Failed to initiate payment. Please try again.');
      console.error('Payment initiation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotal * 0.18; // 18% GST
    const shippingAmount = subtotal >= 1000 ? 0 : 50; // Free shipping over ₹1000
    const total = subtotal + taxAmount + shippingAmount;

    return { subtotal, taxAmount, shippingAmount, total };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  const { subtotal, taxAmount, shippingAmount, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-vintage font-bold text-gray-900 mb-8 text-center">
            Checkout
          </h1>

          {paymentError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {paymentError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-vintage font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  {state.cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.image || '/placeholder-image.jpg'}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">
                          Size: {item.size} | Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-vintage-600">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18% GST)</span>
                    <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">
                      {shippingAmount === 0 ? 'Free' : `₹${shippingAmount.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-vintage-600">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-vintage font-bold text-gray-900 mb-6">
                  Payment Details
                </h2>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">₹</span>
                      </div>
                      <div>
                        <p className="font-semibold">Razorpay</p>
                        <p className="text-sm text-gray-600">Secure payment processing</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Supported Payment Methods</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                      <div>• Credit/Debit Cards</div>
                      <div>• UPI</div>
                      <div>• Net Banking</div>
                      <div>• Wallets</div>
                      <div>• RuPay Cards</div>
                      <div>• International Cards</div>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={loading || !orderData}
                    className="w-full bg-vintage-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-vintage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
                  </button>

                  <div className="text-center text-sm text-gray-600">
                    <p>🔒 Your payment information is secure and encrypted</p>
                    <p>By proceeding, you agree to our Terms of Service</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;

    