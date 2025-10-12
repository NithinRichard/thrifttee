import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './VintageShippingSelector.css';

const VintageShippingSelector = ({
  cartItems,
  shippingAddress,
  onShippingSelect,
  onShippingCostUpdate
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [shippingCosts, setShippingCosts] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadShippingMethods = async () => {
      try {
        const methods = await apiService.getShippingMethods();
        setShippingMethods(methods);

        // Auto-select first method if available
        if (methods.length > 0 && !selectedMethod) {
          setSelectedMethod(methods[0]);
        }
      } catch (error) {
        console.error('Failed to load shipping methods:', error);
        // Fallback to basic methods if API fails
        setShippingMethods([
          { id: 1, name: 'Standard Shipping', description: '3-5 business days', estimated_days: 4 },
          { id: 2, name: 'Express Shipping', description: '1-2 business days', estimated_days: 2 }
        ]);
      }
    };

    loadShippingMethods();
  }, []);

  useEffect(() => {
    if (cartItems?.length && shippingAddress && shippingMethods.length > 0) {
      calculateAllShippingCosts();
    }
  }, [cartItems, shippingAddress, shippingMethods]);

  const calculateAllShippingCosts = async () => {
    if (!cartItems?.length || !shippingAddress) return;

    setLoading(true);

    // Format cart items for API
    const items = cartItems.map(item => {
      const productId = item.product?.id || item.product_id || item.id;
      const quantity = item.quantity || 1;

      return { product_id: productId, quantity };
    }).filter(item => item.product_id);

    if (items.length === 0) {
      setLoading(false);
      return;
    }

    // Calculate cost for each shipping method
    for (const method of shippingMethods) {
      try {
        const response = await apiService.calculateShipping({
          items,
          shipping_address: shippingAddress,
          shipping_method_id: method.id
        });

        if (response && !response.error) {
          setShippingCosts(prev => ({
            ...prev,
            [method.id]: response.shipping_cost
          }));

          // Update parent component with selected method cost
          if (selectedMethod?.id === method.id) {
            onShippingCostUpdate?.(response.shipping_cost);
          }
        }
      } catch (error) {
        console.error(`Failed to calculate shipping for method ${method.id}:`, error);
        // Use fallback pricing
        setShippingCosts(prev => ({
          ...prev,
          [method.id]: method.id === 1 ? 50 : method.id === 2 ? 100 : 150
        }));
      }
    }

    setLoading(false);
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    onShippingSelect?.(method);

    const cost = shippingCosts[method.id];
    if (cost !== undefined) {
      onShippingCostUpdate?.(cost);
    }
  };

  const getMethodIcon = (methodName) => {
    if (methodName.toLowerCase().includes('express') || methodName.toLowerCase().includes('fast')) {
      return '🚀';
    } else if (methodName.toLowerCase().includes('premium')) {
      return '⚡';
    }
    return '📦';
  };

  return (
    <div className="vintage-shipping-container">
      <h2 className="vintage-shipping-title">Choose Your Delivery</h2>

      <div className="shipping-methods-grid">
        {shippingMethods.map((method) => (
          <div
            key={method.id}
            className={`shipping-method-card ${
              selectedMethod?.id === method.id ? 'selected' : ''
            }`}
            onClick={() => handleMethodSelect(method)}
          >
            <div className="method-header">
              <div className="flex items-center">
                <input
                  type="radio"
                  name="shipping-method"
                  value={method.id}
                  className="vintage-radio"
                  checked={selectedMethod?.id === method.id}
                  onChange={() => handleMethodSelect(method)}
                />
                <h3 className="method-name">{method.name}</h3>
              </div>

              <div className="method-price">
                {loading ? (
                  <span className="loading-animation">...</span>
                ) : (
                  `₹${shippingCosts[method.id]?.toFixed(2) || '0.00'}`
                )}
              </div>
            </div>

            <p className="method-description">{method.description}</p>

            <div className="method-timing">
              <span className="method-icon">{getMethodIcon(method.name)}</span>
              <span>{method.estimated_days} {method.estimated_days === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedMethod && (
        <div className="shipping-summary">
          <h3 className="summary-title">Delivery Summary</h3>
          <div className="summary-details">
            <div className="flex justify-between mb-1">
              <span>Method:</span>
              <span className="font-medium">{selectedMethod.name}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Cost:</span>
              <span className="font-medium">₹{shippingCosts[selectedMethod.id]?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated:</span>
              <span className="font-medium">{selectedMethod.estimated_days} {selectedMethod.estimated_days === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VintageShippingSelector;