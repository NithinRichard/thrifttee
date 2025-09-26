import React, { useState } from 'react';
import VintageShippingSelector from '../components/VintageShippingSelector';

const ShippingDemo = () => {
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);

  const cartItems = [
    { product_id: 21, quantity: 1 }
  ];

  const shippingAddress = {
    postal_code: "687767",
    state: "KL", 
    country: "IN"
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Vintage Shipping Demo</h1>
        
        <div className="max-w-2xl mx-auto">
          <VintageShippingSelector
            cartItems={cartItems}
            shippingAddress={shippingAddress}
            onShippingSelect={setSelectedShipping}
            onShippingCostUpdate={setShippingCost}
          />
          
          {selectedShipping && (
            <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Selection Summary</h3>
              <p><strong>Method:</strong> {selectedShipping.name}</p>
              <p><strong>Cost:</strong> ₹{shippingCost.toFixed(2)}</p>
              <p><strong>Estimated Days:</strong> {selectedShipping.estimatedDays}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingDemo;