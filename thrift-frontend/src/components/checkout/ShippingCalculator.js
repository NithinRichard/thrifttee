import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Truck, Clock, DollarSign } from 'lucide-react';
import apiService from '../../services/api';

const ShippingCalculator = ({ cartItems, onShippingCalculated, disabled = false }) => {
  const [shippingAddress, setShippingAddress] = useState({
    postal_code: '',
    state: '',
    country: 'IN'
  });
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [calculationResult, setCalculationResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validateAddress = () => {
    const errors = {};

    if (!shippingAddress.postal_code) {
      errors.postal_code = 'Postal code is required';
    } else if (shippingAddress.postal_code.length !== 6 || !/^\d{6}$/.test(shippingAddress.postal_code)) {
      errors.postal_code = 'Please enter a valid 6-digit postal code';
    }

    if (!shippingAddress.state) {
      errors.state = 'Please select a state';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load available shipping methods
  useEffect(() => {
    const loadShippingMethods = async () => {
      try {
        const response = await apiService.getShippingMethods();
        setShippingMethods(response);
        if (response.length > 0 && !selectedMethod) {
          setSelectedMethod(response[0].id);
        }
      } catch (err) {
        console.error('Failed to load shipping methods:', err);
      }
    };

    loadShippingMethods();
  }, []);

  // Calculate shipping when inputs change
  useEffect(() => {
    if (cartItems && cartItems.length > 0 && shippingAddress.postal_code && selectedMethod && !loading) {
      calculateShipping();
    }
  }, [cartItems, shippingAddress, selectedMethod]);

  const calculateShipping = async () => {
    if (disabled || !cartItems || cartItems.length === 0 || !selectedMethod) return;

    // Validate address
    if (!validateAddress()) {
      setError('Please enter a valid postal code and select a state');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const items = cartItems.map(item => {
        // Handle different cart item structures
        const productId = item.product?.id || item.id;
        if (!productId) {
          console.warn('Cart item missing product ID:', item);
          return null;
        }
        return {
          product_id: productId,
          quantity: item.quantity || 1
        };
      }).filter(Boolean); // Remove null items

      if (items.length === 0) {
        setError('No valid items found in cart');
        setLoading(false);
        return;
      }

      const response = await apiService.calculateShipping({
        items,
        shipping_address: shippingAddress,
        shipping_method_id: selectedMethod
      });

      if (response.error) {
        setError(response.error);
        setCalculationResult(null);
      } else {
        setCalculationResult(response);
        onShippingCalculated && onShippingCalculated(response);
      }
    } catch (err) {
      console.error('Shipping calculation error:', err);
      setError('Failed to calculate shipping cost. Please try again.');
      setCalculationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getMethodIcon = (methodName) => {
    if (methodName.toLowerCase().includes('express') || methodName.toLowerCase().includes('fast')) {
      return '🚀';
    } else if (methodName.toLowerCase().includes('standard')) {
      return '🚚';
    } else if (methodName.toLowerCase().includes('overnight')) {
      return '✈️';
    }
    return '📦';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (disabled) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-500 text-center">Shipping calculator disabled</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-6"
    >
      <h3 className="text-lg font-vintage font-semibold text-gray-900 mb-4 flex items-center">
        <MapPin className="w-5 h-5 mr-2" />
        Shipping Calculator
      </h3>

      {/* Shipping Address Form */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Shipping Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Postal Code *
            </label>
            <input
              type="text"
              value={shippingAddress.postal_code}
              onChange={(e) => handleAddressChange('postal_code', e.target.value)}
              placeholder="110001 (6 digits)"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-vintage-500 focus:border-transparent ${
                validationErrors.postal_code ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength="6"
            />
            {validationErrors.postal_code && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.postal_code}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              State *
            </label>
            <select
              value={shippingAddress.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-vintage-500 focus:border-transparent ${
                validationErrors.state ? 'border-red-300' : 'border-gray-300'
              }`}
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
            </select>
            {validationErrors.state && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.state}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Country
            </label>
            <select
              value={shippingAddress.country}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vintage-500 focus:border-transparent"
              disabled
            >
              <option value="IN">🇮🇳 India</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipping Methods */}
      {shippingMethods.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Shipping Method</h4>
          <div className="space-y-2">
            {shippingMethods.map((method) => (
              <label
                key={method.id}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="shipping_method"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                  className="mr-3 text-vintage-600 focus:ring-vintage-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getMethodIcon(method.name)}</span>
                      <div>
                        <span className="font-medium text-gray-900">{method.name}</span>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {method.estimated_days} {method.estimated_days === 1 ? 'day' : 'days'}
                      </div>
                      {method.max_weight_kg && (
                        <p className="text-xs text-gray-500">
                          Max: {method.max_weight_kg}kg
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="loading-spinner mr-2"></div>
          <span className="text-gray-600">Calculating shipping cost...</span>
        </div>
      )}

      {/* No Shipping Method Selected */}
      {!selectedMethod && shippingMethods.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-600 text-sm">Please select a shipping method to calculate costs</p>
        </div>
      )}

      {/* Calculation Result */}
      {calculationResult && !error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <h4 className="font-medium text-green-800 mb-3 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Shipping Cost Breakdown
          </h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping Zone:</span>
              <span className="font-medium">{calculationResult.zone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Method:</span>
              <span className="font-medium">{calculationResult.method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span className="font-medium">{calculationResult.estimated_days} days</span>
            </div>

            {calculationResult.breakdown && (
              <>
                <hr className="my-2" />
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Base Cost:</span>
                    <span>{formatCurrency(calculationResult.breakdown.base_cost)}</span>
                  </div>
                  {calculationResult.breakdown.weight_cost > 0 && (
                    <div className="flex justify-between">
                      <span>Weight Cost:</span>
                      <span>{formatCurrency(calculationResult.breakdown.weight_cost)}</span>
                    </div>
                  )}
                  {calculationResult.breakdown.insurance_cost > 0 && (
                    <div className="flex justify-between">
                      <span>Insurance:</span>
                      <span>{formatCurrency(calculationResult.breakdown.insurance_cost)}</span>
                    </div>
                  )}
                  {calculationResult.breakdown.free_shipping_applied && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Free Shipping Applied:</span>
                      <span>-{formatCurrency(calculationResult.shipping_cost)}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <hr className="my-2" />
            <div className="flex justify-between text-lg font-bold text-green-800">
              <span>Total Shipping:</span>
              <span>{formatCurrency(calculationResult.shipping_cost)}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* No Items Message */}
      {cartItems.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Add items to your cart to calculate shipping</p>
        </div>
      )}
    </motion.div>
  );
};

export default ShippingCalculator;
