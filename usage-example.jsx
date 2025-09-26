// Usage Example
import React, { useState } from 'react';
import VintageShippingSelector from './VintageShippingSelector';

const CheckoutPage = () => {
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
    <div>
      <VintageShippingSelector
        cartItems={cartItems}
        shippingAddress={shippingAddress}
        onShippingSelect={setSelectedShipping}
        onShippingCostUpdate={setShippingCost}
      />
      
      {selectedShipping && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5' }}>
          <h3>Order Summary</h3>
          <p>Shipping Method: {selectedShipping.name}</p>
          <p>Shipping Cost: ₹{shippingCost.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;