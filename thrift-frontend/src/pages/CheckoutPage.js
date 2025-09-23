
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';
import { formatINR } from '../utils/currency';
import { canProcessPayment, getSecurityStatus, sanitizeForLogging } from '../utils/security';
import {
  isRupayCard,
  validateRupayCard,
  formatRupayCardNumber,
  validateRupayExpiry,
  validateRupayCVV,
  RupayPaymentProcessor,
  createRupayPaymentData,
  getTestCardNumbers
} from '../utils/rupay';

const CheckoutPage = () => {
  const { state, actions } = useApp();
  const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm();
  const [paymentMethod, setPaymentMethod] = useState('rupay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cardType, setCardType] = useState('');

  // Get security status for display
  const securityStatus = getSecurityStatus();

  const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';
  // Rupay payment processor
  const rupayProcessor = new RupayPaymentProcessor({
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
    merchantId: process.env.REACT_APP_RUPAY_MERCHANT_ID || 'demo_merchant',
    terminalId: process.env.REACT_APP_RUPAY_TERMINAL_ID || 'demo_terminal'
  });

  const cartSubtotal = state.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shippingCost = 0;
  const totalCost = cartSubtotal + shippingCost;

  // Get test card numbers for development
  const testCards = getTestCardNumbers();

  // Handle card number input with formatting and validation
  const handleCardNumberChange = (e) => {
    const formatted = formatRupayCardNumber(e.target.value);
    e.target.value = formatted;

    if (formatted.replace(/\s/g, '').length >= 6) {
      const isRupay = isRupayCard(formatted);
      const cardTypeText = isRupay ? 'Rupay' : 'Non-Rupay';
      setCardType(cardTypeText);
    } else {
      setCardType('');
    }

    // Trigger form validation
    const event = new Event('input', { bubbles: true });
    e.target.dispatchEvent(event);
  };

  // Validate form data including Rupay-specific validation
  const validatePaymentData = (data) => {
    const errors = [];

    // Rupay card validation (with test cards allowed in development)
    if (!validateRupayCard(data.cardNumber)) {
      errors.push('Invalid Rupay card number');
    }

    // Expiry validation
    if (!validateRupayExpiry(data.expiryDate)) {
      errors.push('Invalid expiry date or card has expired');
    }

    // CVV validation
    if (!validateRupayCVV(data.cvv)) {
      errors.push('Invalid CVV (must be 3 digits)');
    }

    return errors;
  };

  const onSubmit = async (data) => {
    try {
      actions.setLoading(true);
      setIsProcessingPayment(true);

      // Security validation
      const securityStatus = getSecurityStatus();
      if (!securityStatus.canCollectPayment) {
        throw new Error('Payment processing requires HTTPS connection for security');
      }

      // Validate payment data
      const validationErrors = validatePaymentData(data);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Log sanitized data for debugging
      console.log('Processing Rupay payment with data:', sanitizeForLogging(data));

      // Check if we're in demo mode (no real network calls)
      const isDemoMode = process.env.REACT_APP_DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';

      let paymentResult;

      if (isDemoMode) {
        // Demo mode: Skip network calls and simulate success
        console.log('🎭 Demo mode activated - simulating payment success');

        paymentResult = {
          success: true,
          transactionId: `DEMO_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          authCode: `DEMO_AUTH_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          status: 'success'
        };
      } else {
        // Production mode: Make actual Rupay API calls
        const paymentData = createRupayPaymentData(data, {
          total: totalCost,
          items: state.cart
        });

        const sessionToken = await rupayProcessor.initializePayment({
          amount: totalCost,
          currency: 'INR',
          orderId: paymentData.orderId
        });

        paymentResult = await rupayProcessor.processPayment({
          ...paymentData,
          sessionToken: sessionToken
        });
      }

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment processing failed');
      }

      // Create order in backend with payment result
      const orderData = {
        customer_info: {
          name: data.fullName,
          email: data.email
        },
        order_items: state.cart.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price,
          title: item.title,
          brand: item.brand,
          size: item.size,
          color: item.color
        })),
        shipping_address: `${data.address}, ${data.city}, ${data.state} ${data.zip}`,
        payment_method: 'rupay',
        payment_token: paymentResult.transactionId,
        payment_status: paymentResult.status,
        transaction_details: {
          auth_code: paymentResult.authCode,
          transaction_id: paymentResult.transactionId
        },
        subtotal: cartSubtotal,
        tax_amount: cartSubtotal * 0.18, // 18% GST
        shipping_amount: shippingCost,
        total_amount: totalCost,
        currency: 'INR',
        notes: isDemoMode ? 'Demo mode order' : ''
      };

      await apiService.createOrder(orderData);

      actions.clearCart();

      const transactionId = paymentResult.transactionId;
      alert(`Payment successful! Transaction ID: ${transactionId}`);

    } catch (error) {
      console.error('Payment processing failed:', error);

      if (error.message?.includes('HTTPS')) {
        actions.setError('Secure connection required. Please use HTTPS to complete your payment.');
      } else if (error.message?.includes('Invalid')) {
        actions.setError(`Payment validation error: ${error.message}`);
      } else if (error.message?.includes('not currently supported')) {
        actions.setError('Order creation is temporarily unavailable. Please try again later or contact support.');
      } else if (error.response?.status === 405) {
        actions.setError('Order system is not available. Please contact customer support.');
      } else {
        actions.setError(`Payment failed: ${error.message}`);
      }
    } finally {
      actions.setLoading(false);
      setIsProcessingPayment(false);
    }
  };

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

          {/* Security Alert Banner */}
          <div className={`border rounded-lg p-4 mb-8 ${
            securityStatus.canCollectPayment
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start">
              <svg className={`w-5 h-5 mr-2 mt-0.5 ${
                securityStatus.canCollectPayment ? 'text-green-600' : 'text-yellow-600'
              }`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d={`${
                  securityStatus.canCollectPayment
                    ? 'M10 1L3 5v6c0 5.55 3.84 10 7 11 3.16-1 7-5.45 7-11V5l-7-4zM8 10v4l2-2 2 2v-4h-4z'
                    : 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                }`} clipRule="evenodd" />
              </svg>
              <div>
                <h3 className={`text-sm font-medium ${
                  securityStatus.canCollectPayment ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {securityStatus.canCollectPayment ? (isDemoMode ? 'Demo Mode Active' : 'Rupay Payment Active') : 'Security Warning'}
                </h3>
                <div className={`text-sm mt-1 ${
                  securityStatus.canCollectPayment ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {securityStatus.canCollectPayment ? (
                    <div>
                      <p>✓ HTTPS connection verified</p>
                      <p>✓ {isDemoMode ? 'Demo mode - No real payments' : 'Rupay payment processing active'}</p>
                      <p>✓ NPCI certified gateway</p>
                    </div>
                  ) : (
                    <div>
                      <p>⚠ HTTPS required for Rupay payment processing</p>
                      <p>⚠ Rupay payment integration requires secure connection</p>
                    </div>
                  )}
                </div>
                {securityStatus.warnings.length > 0 && (
                  <ul className="text-xs mt-2 list-disc list-inside">
                    {securityStatus.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Information */}
            <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-vintage font-bold text-gray-900 mb-6">
                Shipping Information
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Full Name</label>
                    <input {...register('fullName', { required: true })} className="input-field" />
                    {errors.fullName && <span className="error-message">This field is required</span>}
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input {...register('email', { required: true, pattern: /\S+@\S+\.\S+/ })} className="input-field" />
                    {errors.email && <span className="error-message">Please enter a valid email</span>}
                  </div>
                </div>
                <div>
                  <label className="label">Address</label>
                  <input {...register('address', { required: true })} className="input-field" />
                  {errors.address && <span className="error-message">This field is required</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="label">City</label>
                    <input {...register('city', { required: true })} className="input-field" />
                    {errors.city && <span className="error-message">This field is required</span>}
                  </div>
                  <div>
                    <label className="label">State</label>
                    <input {...register('state', { required: true })} className="input-field" />
                    {errors.state && <span className="error-message">This field is required</span>}
                  </div>
                  <div>
                    <label className="label">ZIP Code</label>
                    <input {...register('zip', { required: true })} className="input-field" />
                    {errors.zip && <span className="error-message">This field is required</span>}
                  </div>
                </div>

                <h2 className="text-2xl font-vintage font-bold text-gray-900 pt-8 mb-6">
                  Rupay Payment Details
                </h2>

                {/* Development Test Cards Helper */}
                {Object.keys(testCards).length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2"> Development Test Cards</h4>
                    <div className="space-y-2 text-xs">
                      {Object.entries(testCards).map(([cardNumber, description]) => (
                        <div key={cardNumber} className="flex items-center justify-between">
                          <code className="bg-blue-100 px-2 py-1 rounded">{cardNumber}</code>
                          <span className="text-blue-600">{description}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Use any of these test card numbers for development testing
                    </p>
                  </div>
                )}

                {/* Rupay Card Detection */}
                {cardType && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-blue-800">
                        Card Type: {cardType} Card
                      </span>
                    </div>
                  </div>
                )}

                {/* Rupay Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rupay Card Number *
                  </label>
                  <div className="relative">
                    <input
                      {...register('cardNumber', {
                        required: 'Card number is required',
                        validate: (value) => {
                          if (!validateRupayCard(value)) {
                            return 'Invalid Rupay card number';
                          }
                          return true;
                        }
                      })}
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className={`input-field pl-12 ${errors.cardNumber ? 'border-red-500' : ''}`}
                      maxLength={19}
                      onChange={handleCardNumberChange}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 2a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" />
                      </svg>
                    </div>
                  </div>
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Supports all Rupay debit/credit cards</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date *
                    </label>
                    <input
                      {...register('expiryDate', {
                        required: 'Expiry date is required',
                        pattern: {
                          value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                          message: 'Invalid expiry date format (MM/YY)'
                        },
                        validate: (value) => {
                          if (!validateRupayExpiry(value)) {
                            return 'Invalid expiry date or card has expired';
                          }
                          return true;
                        }
                      })}
                      type="text"
                      placeholder="MM/YY"
                      className={`input-field ${errors.expiryDate ? 'border-red-500' : ''}`}
                      maxLength={5}
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
                    )}
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <div className="relative">
                      <input
                        {...register('cvv', {
                          required: 'CVV is required',
                          pattern: {
                            value: /^\d{3}$/,
                            message: 'CVV must be 3 digits'
                          },
                          validate: (value) => {
                            if (!validateRupayCVV(value)) {
                              return 'Invalid CVV format';
                            }
                            return true;
                          }
                        })}
                        type="text"
                        placeholder="123"
                        className={`input-field ${errors.cvv ? 'border-red-500' : ''}`}
                        maxLength={3}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">3-digit security code</p>
                  </div>
                </div>

                {/* Rupay Security Info */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 1L3 5v6c0 5.55 3.84 10 7 11 3.16-1 7-5.45 7-11V5l-7-4zM8 10v4l2-2 2 2v-4h-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-green-800">Rupay Security Features</h4>
                      <ul className="text-xs text-green-700 mt-1 space-y-1">
                        <li>• NPCI certified payment processing</li>
                        <li>• Real-time card validation</li>
                        <li>• Secure tokenization</li>
                        <li>• Indian banking network</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    type="submit"
                    className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={state.loading || state.cart.length === 0 || isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isDemoMode ? 'Processing Demo Payment...' : 'Processing Rupay Payment...'}
                      </span>
                    ) : (
                      `${isDemoMode ? 'Complete Demo Payment' : 'Pay'} ₹${totalCost.toLocaleString('en-IN')} with Rupay`
                    )}
                  </button>

                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">
                      By proceeding, you agree to process payment via Rupay NPCI gateway
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Transaction ID will be generated upon successful payment
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-8 rounded-lg shadow-lg h-fit">
              <h2 className="text-2xl font-vintage font-bold text-gray-900 mb-6">
                Order Summary
              </h2>
              <div className="space-y-4">
                {state.cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-800">{item.title}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-bold text-gray-800">
                      {formatINR(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 my-6"></div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold text-gray-800">
                    {formatINR(cartSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-bold text-gray-800">
                    {formatINR(shippingCost)}
                  </span>
                </div>
                <div className="border-t border-gray-200 my-4"></div>
                <div className="flex justify-between text-xl">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-vintage-600">
                    {formatINR(totalCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
