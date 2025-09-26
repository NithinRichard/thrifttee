# Integration Steps

## 1. Copy Files to Your Frontend Project
```bash
# Copy these files to your React project:
# - vintage-shipping-component.css → src/components/
# - VintageShippingSelector.jsx → src/components/
```

## 2. Update API URL in Component
In VintageShippingSelector.jsx, change:
```javascript
const response = await fetch('/api/v1/products/shipping/calculate/', {
```
To:
```javascript
const response = await fetch('http://localhost:8000/api/v1/products/shipping/calculate/', {
```

## 3. Use in Your Existing Checkout/Cart Component
```javascript
import VintageShippingSelector from './components/VintageShippingSelector';

// In your existing checkout component:
<VintageShippingSelector
  cartItems={yourCartItems}
  shippingAddress={yourShippingAddress}
  onShippingSelect={handleShippingSelect}
  onShippingCostUpdate={handleShippingCostUpdate}
/>
```

## 4. Format Your Data
Ensure your cart items match this format:
```javascript
const cartItems = [
  { product_id: 21, quantity: 1 },
  { product_id: 15, quantity: 2 }
];

const shippingAddress = {
  postal_code: "687767",
  state: "KL", 
  country: "IN"
};
```