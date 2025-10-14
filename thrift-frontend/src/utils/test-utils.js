import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../contexts/AppContext';
import { ToastProvider } from '../contexts/ToastContext';

export const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          {children}
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export const renderWithProviders = (ui, options) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

export const mockProduct = {
  id: 1,
  title: 'Test T-Shirt',
  slug: 'test-tshirt',
  price: '500.00',
  brand: { id: 1, name: 'Test Brand', slug: 'test-brand' },
  category: { id: 1, name: 'T-Shirt', slug: 'tshirt' },
  size: 'M',
  condition: 'excellent',
  quantity: 10,
  images: [{ image: '/test-image.jpg' }],
};

export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
};

export const mockCartItem = {
  id: 1,
  tshirt: mockProduct,
  quantity: 2,
  subtotal: '1000.00',
};

export * from '@testing-library/react';
