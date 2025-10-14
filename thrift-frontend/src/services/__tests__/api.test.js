import axios from 'axios';
import api from '../api';

jest.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Authentication', () => {
    test('login sets token in localStorage', async () => {
      const mockResponse = { data: { token: 'test-token', user: { id: 1 } } };
      axios.post.mockResolvedValue(mockResponse);

      const result = await api.login('testuser', 'password123');

      expect(axios.post).toHaveBeenCalledWith('/api/v1/users/login/', {
        username: 'testuser',
        password: 'password123',
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token');
      expect(result).toEqual(mockResponse.data);
    });

    test('register creates new user', async () => {
      const mockResponse = { data: { token: 'test-token' } };
      axios.post.mockResolvedValue(mockResponse);

      await api.register({ username: 'newuser', email: 'new@test.com', password: 'pass123' });

      expect(axios.post).toHaveBeenCalledWith('/api/v1/users/register/', {
        username: 'newuser',
        email: 'new@test.com',
        password: 'pass123',
      });
    });
  });

  describe('Products', () => {
    test('getProducts fetches product list', async () => {
      const mockProducts = { data: { results: [{ id: 1, title: 'Test' }] } };
      axios.get.mockResolvedValue(mockProducts);

      const result = await api.getProducts();

      expect(axios.get).toHaveBeenCalledWith('/api/v1/products/tshirts/');
      expect(result).toEqual(mockProducts.data);
    });

    test('getProductBySlug fetches single product', async () => {
      const mockProduct = { data: { id: 1, slug: 'test-product' } };
      axios.get.mockResolvedValue(mockProduct);

      await api.getProductBySlug('test-product');

      expect(axios.get).toHaveBeenCalledWith('/api/v1/products/tshirts/test-product/');
    });
  });

  describe('Cart', () => {
    test('addToCart sends product and quantity', async () => {
      const mockResponse = { data: { success: true } };
      axios.post.mockResolvedValue(mockResponse);

      await api.addToCart(1, 2);

      expect(axios.post).toHaveBeenCalledWith('/api/v1/cart/add/', {
        product_id: 1,
        quantity: 2,
      });
    });

    test('getCart fetches cart items', async () => {
      const mockCart = { data: { items: [] } };
      axios.get.mockResolvedValue(mockCart);

      await api.getCart();

      expect(axios.get).toHaveBeenCalledWith('/api/v1/cart/');
    });
  });

  describe('Orders', () => {
    test('createOrder sends order data', async () => {
      const mockResponse = { data: { order_id: 'ORD123' } };
      axios.post.mockResolvedValue(mockResponse);

      const orderData = { address: '123 Main St', pincode: '110001' };
      await api.createOrder(orderData);

      expect(axios.post).toHaveBeenCalledWith('/api/v1/orders/create_razorpay_order/', orderData);
    });
  });
});
