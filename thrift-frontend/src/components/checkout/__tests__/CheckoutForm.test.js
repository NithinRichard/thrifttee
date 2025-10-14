import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../utils/test-utils';
import axios from 'axios';

jest.mock('axios');

const CheckoutForm = ({ onSubmit }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      pincode: formData.get('pincode'),
    };
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Full Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="phone" placeholder="Phone" required />
      <textarea name="address" placeholder="Address" required />
      <input name="pincode" placeholder="Pincode" required />
      <button type="submit">Place Order</button>
    </form>
  );
};

describe('CheckoutForm', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all checkout fields', () => {
    renderWithProviders(<CheckoutForm onSubmit={mockSubmit} />);
    
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Pincode')).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    renderWithProviders(<CheckoutForm onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByPlaceholderText('Full Name'), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Phone'), {
      target: { value: '9876543210' },
    });
    fireEvent.change(screen.getByPlaceholderText('Address'), {
      target: { value: '123 Main St' },
    });
    fireEvent.change(screen.getByPlaceholderText('Pincode'), {
      target: { value: '110001' },
    });
    
    fireEvent.click(screen.getByText('Place Order'));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        address: '123 Main St',
        pincode: '110001',
      });
    });
  });
});
