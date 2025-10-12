import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VintageShippingSelector from './VintageShippingSelector';
import apiService from '../services/api';

// Mock the apiService
jest.mock('../services/api');

describe('VintageShippingSelector', () => {
  const mockCartItems = [{ product_id: 1, quantity: 1 }];
  const mockShippingAddress = { street: '123 Test St', city: 'Testville' };
  const mockShippingMethods = [
    { id: 1, name: 'Standard Shipping', description: '3-5 business days', estimated_days: 4 },
    { id: 2, name: 'Express Shipping', description: '1-2 business days', estimated_days: 2 },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    apiService.getShippingMethods.mockResolvedValue(mockShippingMethods);
    apiService.calculateShipping.mockImplementation(async ({ shipping_method_id }) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      if (shipping_method_id === 1) {
        return { shipping_cost: 100 };
      }
      if (shipping_method_id === 2) {
        return { shipping_cost: 200 };
      }
      return { shipping_cost: 0 };
    });
  });

  test('should not call onShippingCostUpdate with a fallback value when a method is selected before costs are loaded', async () => {
    const onShippingSelect = jest.fn();
    const onShippingCostUpdate = jest.fn();

    render(
      <VintageShippingSelector
        cartItems={mockCartItems}
        shippingAddress={mockShippingAddress}
        onShippingSelect={onShippingSelect}
        onShippingCostUpdate={onShippingCostUpdate}
      />
    );

    // Wait for the shipping methods to be loaded and displayed
    await waitFor(() => {
      expect(screen.getByText('Express Shipping')).toBeInTheDocument();
    });

    // Select the 'Express Shipping' method
    fireEvent.click(screen.getByText('Express Shipping'));

    // Check that onShippingCostUpdate was not called with the fallback value of 50
    expect(onShippingCostUpdate).not.toHaveBeenCalledWith(50);
  });
});
