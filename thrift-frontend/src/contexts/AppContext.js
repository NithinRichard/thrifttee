import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import apiService from '../services/api';

// Initial state
const initialState = {
  // Products
  products: [],
  featuredProducts: [],
  currentProduct: null,
  brands: [],
  categories: [],
  filterOptions: {},
  
  // Cart
  cart: [],
  cartCount: 0,
  cartTotal: 0,
  
  // User
  user: null,
  isAuthenticated: false,
  
  // UI
  loading: false,
  error: null,
  searchQuery: '',
  filters: {},
};

// Action types
export const actionTypes = {
  // Loading and errors
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Products
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_FEATURED_PRODUCTS: 'SET_FEATURED_PRODUCTS',
  SET_CURRENT_PRODUCT: 'SET_CURRENT_PRODUCT',
  SET_BRANDS: 'SET_BRANDS',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_FILTER_OPTIONS: 'SET_FILTER_OPTIONS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  
  // Cart
  SET_CART: 'SET_CART',
  ADD_TO_CART: 'ADD_TO_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  
  // User
  SET_USER: 'SET_USER',
  LOGOUT_USER: 'LOGOUT_USER',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case actionTypes.SET_PRODUCTS:
      return { ...state, products: action.payload };
    
    case actionTypes.SET_FEATURED_PRODUCTS:
      return { ...state, featuredProducts: action.payload };
    
    case actionTypes.SET_CURRENT_PRODUCT:
      return { ...state, currentProduct: action.payload };
    
    case actionTypes.SET_BRANDS:
      return { ...state, brands: action.payload };
    
    case actionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload };
    
    case actionTypes.SET_FILTER_OPTIONS:
      return { ...state, filterOptions: action.payload };
    
    case actionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    
    case actionTypes.SET_FILTERS:
      return { ...state, filters: action.payload };
    
    case actionTypes.SET_CART:
      // Normalize cart payload shape from API
      {
        const raw = action.payload;
        const items = Array.isArray(raw)
          ? raw
          : (raw && Array.isArray(raw.items) ? raw.items : []);
        const cart = items.map((it) => {
          const unitPrice = typeof it.price === 'number'
            ? it.price
            : (it.tshirt?.price ?? it.product?.price ?? 0);
          return {
            ...it,
            price: unitPrice,
            quantity: it.quantity ?? 1,
          };
        });
        const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
        const cartTotal = cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
        return { ...state, cart, cartCount, cartTotal };
      }
    
    case actionTypes.ADD_TO_CART:
      const newItem = action.payload;
      const existingItemIndex = state.cart.findIndex(item => item.id === newItem.id);
      
      let updatedCart;
      if (existingItemIndex >= 0) {
        updatedCart = state.cart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        updatedCart = [...state.cart, newItem];
      }
      
      const newCartCount = updatedCart.reduce((total, item) => total + item.quantity, 0);
      const newCartTotal = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      return {
        ...state,
        cart: updatedCart,
        cartCount: newCartCount,
        cartTotal: newCartTotal
      };
    
    case actionTypes.UPDATE_CART_ITEM:
      const { itemId, quantity } = action.payload;
      const updatedCartItems = state.cart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      
      const updatedCartCount = updatedCartItems.reduce((total, item) => total + item.quantity, 0);
      const updatedCartTotal = updatedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      return {
        ...state,
        cart: updatedCartItems,
        cartCount: updatedCartCount,
        cartTotal: updatedCartTotal
      };
    
    case actionTypes.REMOVE_FROM_CART:
      const filteredCart = state.cart.filter(item => item.id !== action.payload);
      const filteredCartCount = filteredCart.reduce((total, item) => total + item.quantity, 0);
      const filteredCartTotal = filteredCart.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      return {
        ...state,
        cart: filteredCart,
        cartCount: filteredCartCount,
        cartTotal: filteredCartTotal
      };
    
    case actionTypes.CLEAR_CART:
      return { ...state, cart: [], cartCount: 0, cartTotal: 0 };
    
    case actionTypes.SET_USER:
      return { ...state, user: action.payload, isAuthenticated: true };
    
    case actionTypes.LOGOUT_USER:
      return { ...state, user: null, isAuthenticated: false, cart: [], cartCount: 0, cartTotal: 0 };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      // Load filter options (with error handling)
      try {
        const filterOptions = await apiService.getFilterOptions();
        dispatch({ type: actionTypes.SET_FILTER_OPTIONS, payload: filterOptions });
      } catch (error) {
        console.warn('Failed to load filter options:', error.message);
        // Set default empty filter options
        dispatch({ type: actionTypes.SET_FILTER_OPTIONS, payload: {
          brands: [],
          categories: [],
          sizes: [],
          colors: [],
          conditions: [],
          price_range: { min_price: 0, max_price: 100 }
        }});
      }

      // Load brands and categories
      try {
        const [brands, categories] = await Promise.all([
          apiService.getBrands(),
          apiService.getCategories()
        ]);

        dispatch({ type: actionTypes.SET_BRANDS, payload: brands });
        dispatch({ type: actionTypes.SET_CATEGORIES, payload: categories });
      } catch (error) {
        console.warn('Failed to load brands/categories:', error.message);
        // Set default empty arrays
        dispatch({ type: actionTypes.SET_BRANDS, payload: [] });
        dispatch({ type: actionTypes.SET_CATEGORIES, payload: [] });
      }

      // Check for existing auth token
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const user = await apiService.getProfile();
          dispatch({ type: actionTypes.SET_USER, payload: user });

          // Load user's cart
          const cart = await apiService.getCart();
          dispatch({ type: actionTypes.SET_CART, payload: cart });
        } catch (error) {
          // Token might be invalid
          console.warn('Auth token validation failed:', error.message);
          localStorage.removeItem('authToken');
        }
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  // Action creators - memoized with useCallback to prevent infinite re-renders
  const setLoading = useCallback((loading) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: actionTypes.SET_ERROR, payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  }, []);

  const setProducts = useCallback((products) => {
    dispatch({ type: actionTypes.SET_PRODUCTS, payload: products });
  }, []);

  const setFeaturedProducts = useCallback((products) => {
    dispatch({ type: actionTypes.SET_FEATURED_PRODUCTS, payload: products });
  }, []);

  const setCurrentProduct = useCallback((product) => {
    dispatch({ type: actionTypes.SET_CURRENT_PRODUCT, payload: product });
  }, []);

  const setSearchQuery = useCallback((query) => {
    dispatch({ type: actionTypes.SET_SEARCH_QUERY, payload: query });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: actionTypes.SET_FILTERS, payload: filters });
  }, []);

  const addToCart = useCallback((item) => {
    dispatch({ type: actionTypes.ADD_TO_CART, payload: item });
  }, []);

  const updateCartItem = useCallback((itemId, quantity) => {
    dispatch({ type: actionTypes.UPDATE_CART_ITEM, payload: { itemId, quantity } });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: itemId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_CART });
  }, []);

  const login = useCallback((user, token) => {
    localStorage.setItem('authToken', token);
    dispatch({ type: actionTypes.SET_USER, payload: user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    dispatch({ type: actionTypes.LOGOUT_USER });
  }, []);

  // Combine all actions into a single stable object
  const actions = useMemo(() => ({
    setLoading,
    setError,
    clearError,
    setProducts,
    setFeaturedProducts,
    setCurrentProduct,
    setSearchQuery,
    setFilters,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    login,
    logout,
  }), [
    setLoading,
    setError,
    clearError,
    setProducts,
    setFeaturedProducts,
    setCurrentProduct,
    setSearchQuery,
    setFilters,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    login,
    logout,
  ]);

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
