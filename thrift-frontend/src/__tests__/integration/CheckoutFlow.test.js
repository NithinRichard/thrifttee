import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, mockProduct } from '../../utils/test-utils';
import axios from 'axios';

jest.mock('axios');

const CheckoutFlow = () => {
  const [step, setStep] = React.useState(1);
  const [cart, setCart] = React.useState([]);

  const addToCart = async () => {
    await axios.post('/api/v1/cart/add/', { product_id: 1, quantity: 1 });
    setCart([mockProduct]);
    setStep(2);
  };

  const checkout = async () => {
    await axios.post('/api/v1/orders/create_razorpay_order/');
    setStep(3);
  };

  return (
    <div>
      {step === 1 && (
        <div>
          <h1>Product Page</h1>
          <button onClick={addToCart}>Add to Cart</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h1>Cart</h1>
          <p>{cart.length} items</p>
          <button onClick={checkout}>Proceed to Checkout</button>
        </div>
      )}
      {step === 3 && <h1>Order Confirmed</h1>}
    </div>
  );
};

describe('Checkout Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('authToken', 'test-token');
  });

  test('complete checkout flow from product to order', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });

    renderWithProviders(<CheckoutFlow />);

    expect(screen.getByText('Product Page')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Add to Cart'));

    await waitFor(() => {
      expect(screen.getByText('Cart')).toBeInTheDocument();
      expect(screen.getByText('1 items')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Proceed to Checkout'));

    await waitFor(() => {
      expect(screen.getByText('Order Confirmed')).toBeInTheDocument();
    });

    expect(axios.post).toHaveBeenCalledTimes(2);
  });
});
