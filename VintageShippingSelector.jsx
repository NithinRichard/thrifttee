import React, { useState, useEffect } from 'react';
import './vintage-shipping-component.css';

const VintageShippingSelector = ({ 
  cartItems, 
  shippingAddress, 
  onShippingSelect,
  onShippingCostUpdate 
}) => {
  const [shippingMethods, setShippingMethods] = useState([]);
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
    if (!cartItems?.length || !shippingAddress) return;
    
    try {
      const response = await fetch('/api/v1/products/shipping/calculate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          shipping_address: shippingAddress,
          shipping_method_id: methodId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShippingCosts(prev => ({
          ...prev,
          [methodId]: data.shipping_cost
        }));
      }
    } catch (error) {
      console.error('Shipping calculation error:', error);
    }
  };

  useEffect(() => {
    const fetchCosts = async () => {
      setLoading(true);
      for (const method of methods) {
        await calculateShipping(method.id);
      }
      setLoading(false);
    };
    fetchCosts();
  }, [cartItems, shippingAddress]);

  useEffect(() => {
    if (selectedMethod) {
      onShippingCostUpdate?.(shippingCosts[selectedMethod.id] || 0);
    }
  }, [selectedMethod, shippingCosts]);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    onShippingSelect?.(method);
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
              <div>
                <input
                  type="radio"
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
            Selected: {selectedMethod.name}<br/>
            Cost: ₹{shippingCosts[selectedMethod.id]?.toFixed(2) || '0.00'}<br/>
            Estimated: {selectedMethod.estimatedDays}
          </div>
        </div>
      )}
    </div>
  );
};

export default VintageShippingSelector;