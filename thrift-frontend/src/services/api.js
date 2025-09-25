import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Django REST Framework TokenAuthentication expects "Token <key>"
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class ApiService {
  // Generic HTTP methods for flexibility
  async post(endpoint, data = {}) {
    const response = await api.post(endpoint, data);
    return response.data;
  }

  async get(endpoint, params = {}) {
    const response = await api.get(endpoint, { params });
    return response.data;
  }

  async put(endpoint, data = {}) {
    const response = await api.put(endpoint, data);
    return response.data;
  }

  async delete(endpoint) {
    const response = await api.delete(endpoint);
    return response.data;
  }

  // Products
  async getProducts(params = {}) {
    const response = await api.get('/products/tshirts/', { params });
    return response.data;
  }

  async getProductBySlug(slug) {
    const response = await api.get(`/products/tshirts/${slug}/`);
    return response.data;
  }

  async getFeaturedProducts() {
    const response = await api.get('/products/tshirts/featured/');
    return response.data;
  }

  async searchProducts(query) {
    const response = await api.get('/products/tshirts/', {
      params: { search: query }
    });
    return response.data;
  }

  async getSearchSuggestions(query) {
    const response = await api.get('/products/search/suggestions/', {
      params: { q: query }
    });
    return response.data;
  }

  async getFilterOptions() {
    const response = await api.get('/products/filters/');
    return response.data;
  }

  // Brands and Categories
  async getBrands() {
    const response = await api.get('/products/brands/');
    return response.data;
  }

  async getCategories() {
    const response = await api.get('/products/categories/');
    return response.data;
  }

  // Wishlist
  async getWishlist() {
    const response = await api.get('/users/wishlist/');
    return response.data;
  }

  async addToWishlist(productId) {
    const response = await api.post(`/users/wishlist/add/${productId}/`);
    return response.data;
  }

  async removeFromWishlist(productId) {
    const response = await api.delete(`/users/wishlist/remove/${productId}/`);
    return response.data;
  }

  // Cart
  async getCart() {
    const response = await api.get('/cart/');
    return response.data;
  }

  async addToCart(productId, quantity = 1) {
    const response = await api.post('/cart/add/', {
      product_id: productId,
      quantity
    });
    return response.data;
  }

  async updateCartItem(itemId, quantity) {
    const response = await api.put(`/cart/update/${itemId}/`, {
      quantity
    });
    return response.data;
  }

  async clearCart() {
    const response = await api.delete('/cart/clear/');
    return response.data;
  }

  // Orders
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders/', orderData);
      return response.data;
    } catch (error) {
      const isDemo = process.env.REACT_APP_DEMO_MODE === 'true' || process.env.NODE_ENV === 'development';

      // If backend explicitly reports method not allowed, fall back to demo order
      if (error.response?.status === 405) {
        console.error('Orders POST endpoint not implemented in backend');
        if (orderData.payment_method === 'rupay' && isDemo) {
          console.log('Rupay payment data (demo fallback 405):', orderData);
          return {
            id: `demo_order_${Date.now()}`,
            status: 'pending',
            payment_method: 'rupay',
            transaction_id: orderData.payment_token,
            message: 'Demo mode: Order created successfully (405 fallback)'
          };
        }
        throw new Error('Order creation is not currently supported. Please contact support.');
      }

      // Network errors (e.g., backend not running). In demo mode, simulate order creation
      const isNetworkError = !error.response;
      if (isNetworkError && orderData?.payment_method === 'rupay' && isDemo) {
        console.warn('Backend unavailable; simulating order creation in demo mode. Original error:', error);
        return {
          id: `demo_order_${Date.now()}`,
          status: 'pending',
          payment_method: 'rupay',
          transaction_id: orderData.payment_token,
          message: 'Demo mode: Order created successfully (network fallback)'
        };
      }

      throw error;
    }
  }

  async verifyPayment(transactionId, orderId) {
    try {
      const response = await api.post('/orders/verify_payment/', {
        transaction_id: transactionId,
        order_id: orderId
      });
      return response.data;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  }

  async createOrderFromCart(cartData) {
    try {
      const response = await api.post('/orders/create_from_cart/', cartData);
      return response.data;
    } catch (error) {
      console.error('Order creation from cart failed:', error);
      throw error;
    }
  }

  async getOrders() {
    const response = await api.get('/orders/');
    return response.data;
  }

  async getOrder(orderId) {
    const response = await api.get(`/orders/${orderId}/`);
    return response.data;
  }

  // Authentication
  async login(credentials) {
    const response = await api.post('/users/login/', credentials);
    const data = response.data;
    // Persist DRF token from backend response
    if (data?.token) {
      localStorage.setItem('authToken', data.token);
    } else if (data?.access_token) {
      localStorage.setItem('authToken', data.access_token);
    }
    return data;
  }

  async register(userData) {
    const response = await api.post('/users/register/', userData);
    return response.data;
  }

  async logout() {
    const response = await api.post('/users/logout/');
    return response.data;
  }

  async getProfile() {
    const response = await api.get('/users/profile/');
    return response.data;
  }

  async updateProfile(profileData) {
    const response = await api.put('/users/profile/', profileData);
    return response.data;
  }
}

export default new ApiService();
