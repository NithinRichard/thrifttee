import React, { useState, useEffect } from 'react';
import './VintageShippingSelector.css';

const VintageShippingSelector = ({ 
  cartItems, 
  shippingAddress, 
  onShippingSelect,
  onShippingCostUpdate 
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [shippingCosts, setShippingCosts] = useState({});
  const [loading, setLoading] = useState(false);

  const methods = [
    {
      id: 1,
      name: "Standard Delivery",
      description: "Reliable delivery with care & attention",
      icon: "📦",
      estimatedDays: "3-5 business days"
    },
    {
      id: 2,
      name: "Express Delivery", 
      description: "Faster service for urgent needs",
      icon: "🚚",
      estimatedDays: "2-3 business days"
    },
    {
      id: 3,
      name: "Premium Express",
      description: "Priority handling & swift delivery",
      icon: "⚡",
      estimatedDays: "1-2 business days"
    }
  ];

  const calculateShipping = async (methodId) => {
    // Always set fallback prices first
    const fallbackPrices = { 1: 50, 2: 100, 3: 150 };
    setShippingCosts(prev => ({
      ...prev,
      [methodId]: fallbackPrices[methodId] || 50
    }));
    
    if (!cartItems?.length || !shippingAddress) {
      console.log('Using fallback prices - missing cart items or shipping address');
      return;
    }
    
    setLoading(true);
    try {
      // Format items for API with strict validation
      const items = cartItems.map(item => {
        const productId = item.product?.id || item.product_id || item.id || item.tshirt?.id;
        const quantity = item.quantity || 1;
        
        console.log('Processing cart item:', { item, productId, quantity });
        
        return {
          product_id: productId,
          quantity: quantity
        };
      }).filter(item => {
        const isValid = item.product_id && typeof item.product_id === 'number' && item.quantity > 0;
        if (!isValid) {
          console.warn('Filtering out invalid item:', item);
        }
        return isValid;
      });

      if (items.length === 0) {
        console.log('No valid items found, using fallback prices');
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/v1/products/shipping/calculate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shipping_address: shippingAddress,
          shipping_method_id: methodId
        })
      });
      
      const data = await response.json();
      
      if (response.ok && !data.error && data.shipping_cost !== undefined) {
        setShippingCosts(prev => ({
          ...prev,
          [methodId]: data.shipping_cost
        }));
        console.log(`Real shipping cost for method ${methodId}: ₹${data.shipping_cost}`);
      } else {
        console.log(`Using fallback price for method ${methodId}: ₹${fallbackPrices[methodId]}`);
      }
    } catch (error) {
      console.log(`API error, using fallback price for method ${methodId}: ₹${fallbackPrices[methodId]}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set initial fallback prices immediately
    const fallbackPrices = { 1: 50, 2: 100, 3: 150 };
    setShippingCosts(fallbackPrices);
    
    // Then try to calculate real prices
    methods.forEach(method => {
      calculateShipping(method.id);
    });
  }, [cartItems, shippingAddress]);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    onShippingSelect?.(method);
    onShippingCostUpdate?.(shippingCosts[method.id] || 0);
  };

  return (
    <div className="vintage-shipping-container">
      <h2 className="vintage-shipping-title">Choose Your Delivery</h2>
      
      <div className="shipping-methods-grid">
        {methods.map((method) => (
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
              <span className="method-icon">{method.icon}</span>
              <span>{method.estimatedDays}</span>
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
              <span className="font-medium">{selectedMethod.estimatedDays}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VintageShippingSelector;