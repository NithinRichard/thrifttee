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

  async removeFromCart(itemId) {
    const response = await api.delete(`/cart/remove/${itemId}/`);
    return response.data;
  }

  // Orders
  async createOrder(orderData) {
    const response = await api.post('/orders/', orderData);
    return response.data;
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
