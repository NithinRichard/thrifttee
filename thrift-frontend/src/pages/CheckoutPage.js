import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';
import VintageShippingSelector from '../components/VintageShippingSelector';
import GuestCheckout from '../components/checkout/GuestCheckout';
import PostPurchaseAccountCreation from '../components/checkout/PostPurchaseAccountCreation';

const CheckoutPage = () => {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [shippingCost, setShippingCost] = useState(50); // Default shipping cost
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'IN'
  });

  const [isCheckingOrder, setIsCheckingOrder] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(state.isAuthenticated ? 'authenticated' : 'guest'); // 'guest' or 'authenticated' or 'payment' or 'postPurchase'
  const [guestOrderData, setGuestOrderData] = useState(null);
  const [showPostPurchaseOptions, setShowPostPurchaseOptions] = useState(false);

  const handleGuestCheckoutSuccess = (orderId, guestData) => {
    // Guest checkout completed successfully
    setGuestOrderData({
      orderId,
      email: guestData.email,
      firstName: guestData.firstName,
      lastName: guestData.lastName,
      phone: guestData.phone,
      shippingAddress: guestData.shippingAddress
    });
    setCheckoutMode('payment');
    // Initialize payment for guest order
    initializeGuestPayment(orderId);
  };

  const initializeGuestPayment = async (orderId) => {
    try {
      setLoading(true);
      const response = await apiService.post('/orders/create_guest_payment/', {
        order_id: orderId
      });
      setOrderData(response);
    } catch (error) {
      setPaymentError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountCreated = (accountData) => {
    // Account created successfully
    setShowPostPurchaseOptions(false);
    navigate('/profile');
  };

  const handleBackToGuest = () => {
    setCheckoutMode('guest');
    setOrderData(null);
    setGuestOrderData(null);
  };

  const handleSkipAccountCreation = () => {
    // User chose to skip account creation
    setShowPostPurchaseOptions(false);
    navigate('/');
  };

  useEffect(() => {
    // Prevent multiple simultaneous calls using a ref instead of state
    if (isCheckingOrder) return;

    // Check for pending order first, regardless of authentication state
    setIsCheckingOrder(true);
    checkForExistingOrder();
  }, [navigate, state.isAuthenticated]); // Include missing dependencies but not actions

  const checkForExistingOrder = async () => {
    try {
      // First check if there's already a pending order
      const pendingResponse = await apiService.get('/orders/pending_order/');

      if (pendingResponse.has_pending_order) {
        // User has a pending order, check if they're authenticated
        if (!state.isAuthenticated) {
          // Try to refresh authentication first
          try {
            setPaymentError('Refreshing your session...');
            await actions.refreshAuth();
            // If successful, update the state instead of reloading
            setPaymentError('Session refreshed successfully!');
            // Re-check for existing order with updated authentication
            setTimeout(async () => {
              try {
                const retryResponse = await apiService.get('/orders/pending_order/');
                if (retryResponse.has_pending_order) {
                  setOrderData({
                    ...retryResponse,
                    amount: retryResponse.amount, // Already in paise
                    key: retryResponse.key
                  });
                  setLoading(false);
                } else {
                  // No pending order after refresh, fall back to normal flow
                  if (state.cart.length === 0) {
                    navigate('/products');
                  } else {
                    initializeCheckout();
                  }
                }
              } catch (retryError) {
                console.error('Retry failed:', retryError);
                setPaymentError('Failed to refresh session. Please login again.');
                setTimeout(() => {
                  navigate('/login', {
                    state: {
                      redirectTo: '/checkout',
                      message: 'Please login to continue with your order.'
                    }
                  });
                }, 2000);
              }
            }, 1000);
            return;
          } catch (refreshError) {
            console.warn('Token refresh failed:', refreshError);
          }

          // Try to refresh authentication or handle unauthenticated state
          setPaymentError('Your session may have expired. Please login to continue with your pending order.');
          setTimeout(() => {
            setIsCheckingOrder(false);
            navigate('/login', {
              state: {
                redirectTo: '/checkout',
                message: 'You have a pending order. Please login to continue.'
              }
            });
          }, 2000);
          return;
        }

        // User is authenticated and has pending order, use it
        setOrderData({
          ...pendingResponse,
          amount: pendingResponse.amount, // Already in paise
          key: pendingResponse.key
        });
        setLoading(false);
        setIsCheckingOrder(false);
        return;
      }

      // No pending order found - allow guest checkout
      // if (!state.isAuthenticated) {
      //   setIsCheckingOrder(false);
      //   navigate('/login');
      //   return;
      // }

      if (state.cart.length === 0) {
        setIsCheckingOrder(false);
        navigate('/products');
        return;
      }

      // Create new order
      initializeCheckout();
    } catch (error) {
      console.error('Error checking for existing order:', error);
      setIsCheckingOrder(false);

      // If it's an authentication error, try to refresh the token
      if (error.response?.status === 401) {
        try {
          await actions.refreshAuth();
          // If successful, try again with a direct API call instead of recursion
          setTimeout(async () => {
            try {
              const retryResponse = await apiService.get('/orders/pending_order/');
              if (retryResponse.has_pending_order) {
                setOrderData({
                  ...retryResponse,
                  amount: retryResponse.amount, // Already in paise
                  key: retryResponse.key
                });
                setLoading(false);
              } else {
                // No pending order after refresh, fall back to normal flow
                if (state.cart.length === 0) {
                  setIsCheckingOrder(false);
                  navigate('/products');
                } else {
                  setIsCheckingOrder(false);
                  initializeCheckout();
                }
              }
            } catch (retryError) {
              console.error('Retry failed:', retryError);
              setIsCheckingOrder(false);
              setPaymentError('Failed to refresh session. Please login again.');
              setTimeout(() => {
                navigate('/login', {
                  state: {
                    redirectTo: '/checkout',
                    message: 'Please login to continue with your order.'
                  }
                });
              }, 2000);
            }
          }, 1000);
          return;
        } catch (refreshError) {
          console.warn('Token refresh failed:', refreshError);
          setIsCheckingOrder(false);
        }
      }

      // If error checking pending order, fall back to normal flow
      // Allow guest checkout
      // if (!state.isAuthenticated) {
      //   setIsCheckingOrder(false);
      //   navigate('/login');
      //   return;
      // }

      if (state.cart.length === 0) {
        setIsCheckingOrder(false);
        navigate('/products');
        return;
      }

      setIsCheckingOrder(false);
      initializeCheckout();
    }
  };

  const initializeCheckout = async () => {
    try {
      setLoading(true);

      // No pending order, create a new one
      const response = await apiService.post('/orders/create_razorpay_order/', {});
      setOrderData(response);
    } catch (error) {
      setPaymentError('Failed to initialize payment. Please try again.');
      console.error('Checkout initialization error:', error);
    } finally {
      setLoading(false);
      setIsCheckingOrder(false);
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
            console.log('Verification response:', verificationResponse);

            if (verificationResponse && verificationResponse.status === 'success') {
              // Clear frontend cart state after successful payment (backend already cleared it)
              actions.clearCartLocal();

              // Show post-purchase account creation option for guest users
              if (checkoutMode === 'payment' && guestOrderData) {
                setShowPostPurchaseOptions(true);
              } else {
                // For authenticated users, show success message then redirect
                setPaymentError('');
                alert('Payment successful! Order confirmation email sent. Redirecting to your orders...');
                setTimeout(() => navigate('/profile'), 1000);
              }
            } else {
              console.error('Payment verification failed:', verificationResponse);
              setPaymentError('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);

            if (error.response?.status === 401) {
              // Authentication failed, redirect to login
              setPaymentError('Authentication failed. Please login again.');
              setTimeout(() => {
                navigate('/login');
              }, 2000);
            } else {
              setPaymentError('Payment verification failed. Please try again.');
            }
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
        // If not loaded, try to load it dynamically
        setLoading(true);
        setPaymentError('Loading payment gateway...');

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          if (window.Razorpay) {
            const rzp = new window.Razorpay(options);
            rzp.open();
          } else {
            setPaymentError('Failed to load payment gateway. Please refresh and try again.');
          }
        };
        script.onerror = () => {
          setPaymentError('Failed to load payment gateway. Please check your internet connection and try again.');
        };
        document.body.appendChild(script);
      }
      setLoading(false);
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
    const total = subtotal + taxAmount + shippingCost;

    return { subtotal, taxAmount, shippingCost, total };
  };

  const [selectedShipping, setSelectedShipping] = useState(null);

  const handleShippingSelect = (method) => {
    setSelectedShipping(method);
  };

  const handleShippingCostUpdate = (cost) => {
    setShippingCost(cost || 50); // Fallback to ₹50 if no cost provided
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));

    // Auto-calculate shipping when state is selected
    if (name === 'state' && value && shippingAddress.postal_code) {
      // Trigger shipping calculation after a short delay
      setTimeout(() => {
        // The VintageShippingSelector will automatically recalculate when shippingAddress changes
      }, 100);
    }
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
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <p className="mobile-text-sm">{paymentError}</p>
              </div>
            </div>
          )}

          {/* Guest Checkout Mode */}
          {checkoutMode === 'guest' && (
            <div className="max-w-4xl mx-auto">
              {/* Checkout Mode Selector */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-vintage-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Guest Checkout</h3>
                    <p className="text-sm text-gray-600">Quick & Easy</p>
                  </div>

                  <div className="hidden sm:block text-2xl text-gray-300">→</div>

                  <button
                    onClick={() => setCheckoutMode('authenticated')}
                    className="text-vintage-600 hover:text-vintage-700 font-medium text-sm underline"
                  >
                    Login Instead →
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 text-center">
                    💡 <strong>Guest Checkout:</strong> Continue without creating an account. Your order details will be saved and you can create an account later if you wish.
                  </p>
                </div>
              </div>

              <GuestCheckout
                onSuccess={handleGuestCheckoutSuccess}
                onBackToLogin={() => setCheckoutMode('authenticated')}
              />
            </div>
          )}

          {/* Authenticated Checkout Mode */}
          {checkoutMode === 'authenticated' && (
            <>
              {/* Back to Guest Option */}
              <div className="text-center mb-6">
                <button
                  onClick={() => setCheckoutMode('guest')}
                  className="text-vintage-600 hover:text-vintage-700 font-medium text-sm underline"
                >
                  ← Back to Guest Checkout
                </button>
              </div>

              {/* Mobile-First Layout: Stacked on mobile, 3-column on desktop */}
              <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8 mb-12">
                {/* Order Summary - Most important on mobile */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="lg:col-span-1 order-1"
                >
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="mobile-text-xl font-vintage font-bold text-gray-900 mb-4">
                      Order Summary
                    </h2>

                    <div className="space-y-3">
                      {state.cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <img
                            src={item.image || '/placeholder-image.jpg'}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-grow min-w-0">
                            <h3 className="mobile-product-title">{item.title}</h3>
                            <p className="mobile-text-xs text-gray-600">
                              Size: {item.size} | Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="mobile-product-price">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                      <div className="flex justify-between mobile-text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mobile-text-sm">
                        <span className="text-gray-600">Tax (18% GST)</span>
                        <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mobile-text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium">
                          {shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between mobile-text-lg font-bold text-gray-900">
                          <span>Total</span>
                          <span className="text-vintage-600">₹{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Shipping Address */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="lg:col-span-1 order-2"
                >
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="mobile-text-xl font-vintage font-bold text-gray-900 mb-4">
                      Shipping Address
                    </h2>
                    <div className="space-y-3">
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        className="mobile-input"
                        required
                      />
                      <textarea
                        name="address"
                        placeholder="Street Address"
                        value={shippingAddress.address}
                        onChange={handleAddressChange}
                        rows={3}
                        className="mobile-input"
                        required
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={shippingAddress.city}
                          onChange={handleAddressChange}
                          className="mobile-input"
                          required
                        />
                        <select
                          name="state"
                          value={shippingAddress.state}
                          onChange={handleAddressChange}
                          className="mobile-input"
                          required
                        >
                          <option value="">Select State</option>
                          <option value="AP">Andhra Pradesh</option>
                          <option value="AR">Arunachal Pradesh</option>
                          <option value="AS">Assam</option>
                          <option value="BR">Bihar</option>
                          <option value="CG">Chhattisgarh</option>
                          <option value="GA">Goa</option>
                          <option value="GJ">Gujarat</option>
                          <option value="HR">Haryana</option>
                          <option value="HP">Himachal Pradesh</option>
                          <option value="JK">Jammu and Kashmir</option>
                          <option value="JH">Jharkhand</option>
                          <option value="KA">Karnataka</option>
                          <option value="KL">Kerala</option>
                          <option value="MP">Madhya Pradesh</option>
                          <option value="MH">Maharashtra</option>
                          <option value="MN">Manipur</option>
                          <option value="ML">Meghalaya</option>
                          <option value="MZ">Mizoram</option>
                          <option value="NL">Nagaland</option>
                          <option value="OR">Odisha</option>
                          <option value="PB">Punjab</option>
                          <option value="RJ">Rajasthan</option>
                          <option value="SK">Sikkim</option>
                          <option value="TN">Tamil Nadu</option>
                          <option value="TG">Telangana</option>
                          <option value="TR">Tripura</option>
                          <option value="UP">Uttar Pradesh</option>
                          <option value="UT">Uttarakhand</option>
                          <option value="WB">West Bengal</option>
                          <option value="DL">Delhi</option>
                          <option value="PY">Puducherry</option>
                          <option value="LD">Lakshadweep</option>
                          <option value="AN">Andaman and Nicobar Islands</option>
                          <option value="DN">Dadra and Nagar Haveli</option>
                          <option value="CH">Chandigarh</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        name="postal_code"
                        placeholder="PIN Code (e.g., 695586 for Kerala)"
                        value={shippingAddress.postal_code}
                        onChange={handleAddressChange}
                        className="mobile-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <VintageShippingSelector
                      cartItems={state.cart.map(item => ({ product_id: item.id, quantity: item.quantity }))}
                      shippingAddress={shippingAddress}
                      onShippingSelect={handleShippingSelect}
                      onShippingCostUpdate={handleShippingCostUpdate}
                    />
                  </div>
                </motion.div>

                {/* Payment Section */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="lg:col-span-1 order-3"
                >
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="mobile-text-xl font-vintage font-bold text-gray-900 mb-4">
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
                            <p className="mobile-text-sm text-gray-600">Secure payment processing</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">Supported Payment Methods</h3>
                        <div className="grid grid-cols-2 gap-2 mobile-text-xs text-blue-800">
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
                        className="mobile-button mobile-button-primary w-full"
                      >
                        {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
                      </button>

                      <div className="text-center mobile-text-sm text-gray-600">
                        <p>🔒 Your payment information is secure and encrypted</p>
                        <p>By proceeding, you agree to our Terms of Service</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}

          {/* Payment Mode (for both guest and authenticated) */}
          {checkoutMode === 'payment' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <button
                  onClick={handleBackToGuest}
                  className="text-vintage-600 hover:text-vintage-700 font-medium text-sm underline"
                >
                  ← Back to Checkout
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <h2 className="text-2xl font-vintage font-bold text-gray-900 mb-6 text-center">
                  Complete Payment
                </h2>

                <div className="text-center mb-8">
                  <p className="text-gray-600 mb-2">Order #{guestOrderData?.orderId}</p>
                  <p className="text-sm text-gray-500">Email: {guestOrderData?.email}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Payment Method</h3>
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">₹</span>
                    </div>
                    <div>
                      <p className="font-semibold">Razorpay</p>
                      <p className="mobile-text-sm text-gray-600">Secure payment processing</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={loading || !orderData}
                  className="mobile-button mobile-button-primary w-full mb-4"
                >
                  {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
                </button>

                <div className="text-center mobile-text-sm text-gray-600">
                  <p>🔒 Your payment information is secure and encrypted</p>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Post-Purchase Account Creation Modal */}
      {showPostPurchaseOptions && guestOrderData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <PostPurchaseAccountCreation
            guestData={{
              orderId: guestOrderData.orderId,
              email: guestOrderData.email,
              firstName: guestOrderData.firstName,
              lastName: guestOrderData.lastName,
              phone: guestOrderData.phone,
              shippingAddress: guestOrderData.shippingAddress
            }}
            onAccountCreated={handleAccountCreated}
            onSkip={handleSkipAccountCreation}
          />
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;