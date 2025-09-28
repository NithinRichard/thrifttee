import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import apiService from '../services/api';
import { validateQuantity } from '../utils/validation';
import { useToast } from './ToastContext';

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

  // Wishlist
  wishlist: [],
  wishlistCount: 0,

  // User
  user: null,
  isAuthenticated: false,
  
  // UI
  loading: false,
  error: null,
  searchQuery: '',
  filters: {},
};

const normalizeUser = (payload) => {
  if (!payload) return null;

  const userPayload = payload.user ?? payload;
  const rawFullName = (payload.full_name ?? userPayload.full_name ?? '').trim();
  const firstName = (userPayload.first_name ?? '').trim();
  const lastName = (userPayload.last_name ?? '').trim();
  const generatedFullName = [firstName, lastName].filter(Boolean).join(' ');
  const email = userPayload.email ?? payload.email ?? '';

  let profile = null;
  if (payload.user) {
    const { user: _nestedUser, ...profileFields } = payload;
    profile = profileFields;
  }

  return {
    ...userPayload,
    email,
    full_name: rawFullName || generatedFullName || userPayload.username || (email ? email.split('@')[0] : '') || 'User',
    ...(profile ? { profile } : {}),
  };
};

const normalizeWishlistItem = (payload) => {
  if (!payload) return null;

  const wishlistEntryId = payload.id ?? null;
  const tshirt = payload.tshirt ?? payload.product ?? payload;
  if (!tshirt) return null;

  const id = tshirt.id ?? payload.tshirt_id ?? payload.product_id;
  if (!id) return null;

  const rawImages = Array.isArray(tshirt.all_images) ? tshirt.all_images : undefined;
  const primaryImage = tshirt.primary_image || (rawImages && rawImages[0]) || payload.image || payload.primary_image;
  const price = typeof tshirt.price === 'number' ? tshirt.price : Number(tshirt.price ?? 0);
  const allImages = rawImages || (primaryImage ? [primaryImage] : []);

  return {
    id,
    wishlistEntryId,
    slug: tshirt.slug,
    title: tshirt.title,
    price,
    brand: tshirt.brand ?? payload.brand ?? null,
    category: tshirt.category ?? payload.category ?? null,
    size: tshirt.size ?? payload.size ?? null,
    color: tshirt.color ?? payload.color ?? null,
    condition: tshirt.condition ?? payload.condition ?? null,
    description: tshirt.description ?? payload.description ?? '',
    original_price: typeof tshirt.original_price === 'number'
      ? tshirt.original_price
      : Number(tshirt.original_price ?? payload.original_price ?? price),
    primary_image: primaryImage,
    all_images: allImages,
    image: primaryImage,
    product: tshirt,
    created_at: payload.created_at,
  };
};

const normalizeWishlist = (items) => {
  if (!items) return [];
  const array = Array.isArray(items) ? items : items.results || [];
  return array
    .map((entry) => normalizeWishlistItem(entry))
    .filter(Boolean);
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
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  SET_WISHLIST: 'SET_WISHLIST',
  REMOVE_FROM_WISHLIST: 'REMOVE_FROM_WISHLIST',
  CLEAR_WISHLIST: 'CLEAR_WISHLIST',
  
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
      {
        const raw = action.payload;

        if (!raw || (Array.isArray(raw) && raw.length === 0) || (raw?.items && raw.items.length === 0)) {
          localStorage.removeItem('localCart');
          return { ...state, cart: [], cartCount: 0, cartTotal: 0 };
        }

        const items = Array.isArray(raw)
          ? raw
          : (raw && Array.isArray(raw.items) ? raw.items : []);
        const cart = items.map((it) => {
          const tshirt = it.tshirt || it.product || {};
          const cartItemId = it.id ?? it.cart_item_id ?? it.cartItemId ?? null;
          const productId = tshirt?.id ?? it.product_id ?? it.productId ?? null;
          const itemPrice = it.tshirt_price ?? it.price ?? tshirt?.price ?? 0;
          const parsedPrice = typeof itemPrice === 'string' ? parseFloat(itemPrice) : itemPrice;
          const unitPrice = (typeof parsedPrice === 'number' && parsedPrice > 0)
            ? parsedPrice
            : (typeof tshirt?.price === 'number' && tshirt.price > 0 ? tshirt.price : 0);
          const image = it.tshirt_image ?? it.image ?? tshirt.primary_image ?? (Array.isArray(tshirt.all_images) ? tshirt.all_images[0] : undefined);

          return {
            ...it,
            cartItemId,
            productId,
            id: cartItemId ?? productId ?? it.id,
            title: it.tshirt_title ?? it.title ?? tshirt.title,
            slug: it.slug ?? tshirt.slug,
            brand: it.tshirt_brand ?? it.brand ?? tshirt.brand?.name,
            category: it.tshirt_category ?? tshirt.category?.name,
            size: it.size ?? tshirt.size,
            color: it.color ?? tshirt.color,
            image,
            price: unitPrice,
            quantity: it.quantity ?? 1,
            original_price: it.original_price ?? tshirt.original_price ?? unitPrice,
          };
        });
        const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
        const cartTotal = cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
        return { ...state, cart, cartCount, cartTotal };
      }
    
    case actionTypes.ADD_TO_CART: {
      const rawPayload = action.payload;

      const items = Array.isArray(rawPayload)
        ? rawPayload
        : (rawPayload && Array.isArray(rawPayload.items) ? rawPayload.items : [rawPayload]);

      const normalized = items
        .map((entry) => {
          const tshirt = entry.tshirt || entry.product || {};
          const cartItemId = entry.id ?? entry.cart_item_id ?? entry.cartItemId ?? null;
          const productId = entry.product_id ?? entry.productId ?? tshirt?.id ?? null;
          const unitPrice = typeof entry.price === 'number' && entry.price > 0
            ? entry.price
            : (typeof tshirt?.price === 'number' ? tshirt.price : 0);

          if (!cartItemId && !productId) {
            return null;
          }

          const existing = state.cart.find(item => {
            const itemKey = item.cartItemId ?? item.productId ?? item.id;
            const incomingKey = cartItemId ?? productId;
            return itemKey === incomingKey;
          });

          const mergedQuantity = (entry.quantity ?? existing?.quantity ?? 1);

          return {
            ...(existing || {}),
            ...entry,
            cartItemId: cartItemId ?? existing?.cartItemId,
            productId: productId ?? existing?.productId,
            id: cartItemId ?? productId ?? existing?.id,
            title: entry.title || existing?.title || tshirt.title,
            slug: entry.slug || existing?.slug || tshirt.slug,
            brand: entry.brand || existing?.brand || tshirt.brand?.name,
            size: entry.size || existing?.size || tshirt.size,
            color: entry.color || existing?.color || tshirt.color,
            image: entry.image || existing?.image || tshirt.primary_image || (Array.isArray(tshirt.all_images) ? tshirt.all_images[0] : undefined),
            price: unitPrice,
            quantity: mergedQuantity,
          };
        })
        .filter(Boolean);

      let combinedCart = [...state.cart];
      normalized.forEach((incoming) => {
        const key = incoming.cartItemId ?? incoming.productId ?? incoming.id;
        const idx = combinedCart.findIndex(item => (item.cartItemId ?? item.productId ?? item.id) === key);
        if (idx >= 0) {
          combinedCart[idx] = { ...combinedCart[idx], ...incoming };
        } else {
          combinedCart.push(incoming);
        }
      });

      const newCartCount = combinedCart.reduce((total, item) => total + (item.quantity || 0), 0);
      const newCartTotal = combinedCart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);

      return {
        ...state,
        cart: combinedCart,
        cartCount: newCartCount,
        cartTotal: newCartTotal
      };
    }

    case actionTypes.UPDATE_CART_ITEM: {
      const { itemId, quantity } = action.payload;
      const updatedCartItems = state.cart.map(item => {
        const matches =
          (item.cartItemId && item.cartItemId === itemId) ||
          (item.productId && item.productId === itemId) ||
          item.id === itemId;
        return matches ? { ...item, quantity } : item;
      });

      const updatedCartCount = updatedCartItems.reduce((total, item) => total + (item.quantity || 0), 0);
      const updatedCartTotal = updatedCartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);

      return {
        ...state,
        cart: updatedCartItems,
        cartCount: updatedCartCount,
        cartTotal: updatedCartTotal
      };
    }

    case actionTypes.REMOVE_FROM_CART: {
      const filteredCart = state.cart.filter(item => {
        const matches =
          (item.cartItemId && item.cartItemId === action.payload) ||
          (item.productId && item.productId === action.payload) ||
          item.id === action.payload;
        return !matches;
      });
      const filteredCartCount = filteredCart.reduce((total, item) => total + (item.quantity || 0), 0);
      const filteredCartTotal = filteredCart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);

      return {
        ...state,
        cart: filteredCart,
        cartCount: filteredCartCount,
        cartTotal: filteredCartTotal
      };
    }
    
    case actionTypes.CLEAR_CART:
      return { ...state, cart: [], cartCount: 0, cartTotal: 0 };
    
    case actionTypes.SET_WISHLIST: {
      const wishlist = normalizeWishlist(action.payload);
      return { ...state, wishlist, wishlistCount: wishlist.length };
    }

    case actionTypes.ADD_TO_WISHLIST: {
      const newItem = normalizeWishlistItem(action.payload);
      if (!newItem) return state;

      const currentWishlist = state.wishlist || [];
      const existingIndex = currentWishlist.findIndex(item => item.id === newItem.id);

      let wishlist;
      if (existingIndex >= 0) {
        wishlist = currentWishlist.map(item =>
          item.id === newItem.id ? { ...item, ...newItem } : item
        );
      } else {
        wishlist = [...currentWishlist, newItem];
      }

      return {
        ...state,
        wishlist,
        wishlistCount: wishlist.length,
      };
    }

    case actionTypes.REMOVE_FROM_WISHLIST: {
      const wishlist = (state.wishlist || []).filter(item => item.id !== action.payload);
      return {
        ...state,
        wishlist,
        wishlistCount: wishlist.length,
      };
    }

    case actionTypes.CLEAR_WISHLIST:
      return { ...state, wishlist: [], wishlistCount: 0 };

    case actionTypes.SET_USER:
      return { ...state, user: normalizeUser(action.payload), isAuthenticated: true };
    
    case actionTypes.LOGOUT_USER:
      localStorage.removeItem('localCart');
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        cart: [],
        cartCount: 0,
        cartTotal: 0,
        wishlist: [],
        wishlistCount: 0
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const toast = useToast();

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

      // Load local cart for unauthenticated users (only if no auth token)
      if (!token) {
        const localCart = localStorage.getItem('localCart');
        if (localCart) {
          try {
            const parsedCart = JSON.parse(localCart);
            dispatch({ type: actionTypes.SET_CART, payload: parsedCart });
          } catch (error) {
            console.warn('Failed to parse local cart:', error);
            localStorage.removeItem('localCart');
          }
        }
      }
      if (token) {
        // Add retry logic for token validation
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            const user = await apiService.getProfile();
            dispatch({ type: actionTypes.SET_USER, payload: user });

            // Load user's cart and merge with local cart
            try {
              const backendCart = await apiService.getCart();
              const localCart = localStorage.getItem('localCart');
              
              if (localCart) {
                try {
                  const parsedLocalCart = JSON.parse(localCart);
                  // Merge local cart with backend cart (local takes priority)
                  const mergedCart = [...parsedLocalCart];
                  
                  // Add backend items that aren't in local cart
                  if (backendCart && Array.isArray(backendCart)) {
                    backendCart.forEach(backendItem => {
                      const existsInLocal = parsedLocalCart.find(localItem => localItem.id === backendItem.id);
                      if (!existsInLocal) {
                        mergedCart.push(backendItem);
                      }
                    });
                  }
                  
                  dispatch({ type: actionTypes.SET_CART, payload: mergedCart });
                } catch (parseError) {
                  console.warn('Failed to parse local cart, using backend cart:', parseError);
                  dispatch({ type: actionTypes.SET_CART, payload: backendCart });
                }
              } else {
                dispatch({ type: actionTypes.SET_CART, payload: backendCart });
              }
            } catch (cartError) {
              console.warn('Failed to load backend cart, keeping local cart:', cartError.message);
            }

            try {
              const wishlist = await apiService.getWishlist();
              dispatch({ type: actionTypes.SET_WISHLIST, payload: wishlist });
            } catch (wishlistError) {
              console.warn('Failed to load wishlist during initialization:', wishlistError.message);
            }

            // Successfully authenticated, break out of retry loop
            break;
          } catch (error) {
            retryCount++;
            console.warn(`Auth token validation failed (attempt ${retryCount}/${maxRetries}):`, error.message);

            if (retryCount >= maxRetries && error?.response?.status === 401) {
              // All retries failed AND it's specifically an auth error, remove invalid token
              console.warn('All token validation retries failed, removing token');
              localStorage.removeItem('authToken');
              dispatch({ type: actionTypes.LOGOUT_USER });
              dispatch({ type: actionTypes.SET_ERROR, payload: 'Session expired. Please login again.' });
            } else {
              // Wait before retry (exponential backoff) - only for non-auth errors
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            }
          }
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

  const addToCart = useCallback(async (item, quantity = 1) => {
    const validQuantity = validateQuantity(quantity, 1);

    const payload = {
      product_id: item.id ?? item.productId,
      quantity: validQuantity,
    };

    try {
      const response = await apiService.addToCart(payload.product_id, payload.quantity);

      dispatch({ type: actionTypes.SET_CART, payload: response });

      const persistedItems = response?.items ?? response ?? [];
      if (persistedItems.length > 0) {
        localStorage.setItem('localCart', JSON.stringify(persistedItems));
      } else {
        localStorage.removeItem('localCart');
      }

      // Show success toast with item details
      const itemTitle = item.title || item.name || 'Item';
      toast.showSuccess(`Added ${validQuantity} ${validQuantity > 1 ? 'units' : 'unit'} of ${itemTitle} to cart!`);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Item not available.';
      toast.showError(errorMessage);
      throw error; // Re-throw to allow calling component to handle if needed
    }
  }, [toast]);

  const updateCartItem = useCallback(async (itemId, quantity) => {
    try {
      const validQuantity = validateQuantity(quantity, 1);
      const response = await apiService.updateCartItem(itemId, validQuantity);

      dispatch({ type: actionTypes.SET_CART, payload: response });

      const persistedItems = response?.items ?? response ?? [];
      localStorage.setItem('localCart', JSON.stringify(persistedItems));

      toast.showSuccess('Cart updated successfully!');
    } catch (error) {
      console.error('Failed to update cart item:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Quantity exceeds available stock.';
      toast.showError(errorMessage);
    }
  }, [toast]);

  const removeFromCart = useCallback(async (itemId) => {
    try {
      let response = null;
      try {
        response = await apiService.removeFromCart(itemId);
      } catch (error) {
        console.warn('Backend cart removal failed, falling back to local cart:', error);
      }

      if (response) {
        dispatch({ type: actionTypes.SET_CART, payload: response });
        const persistedItems = response?.items ?? response ?? [];
        if (persistedItems.length > 0) {
          localStorage.setItem('localCart', JSON.stringify(persistedItems));
        } else {
          localStorage.removeItem('localCart');
        }
      } else {
        // Fallback to local cart management
        const currentCart = state.cart;
        const updatedCart = currentCart.filter(item => {
          const matches =
            (item.cartItemId && item.cartItemId === itemId) ||
            (item.productId && item.productId === itemId) ||
            item.id === itemId;
          return !matches;
        });

        dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: itemId });

        if (updatedCart.length > 0) {
          localStorage.setItem('localCart', JSON.stringify(updatedCart));
        } else {
          localStorage.removeItem('localCart');
        }
      }

      toast.showSuccess('Item removed from cart!');
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      toast.showError('Failed to remove item from cart. Please try again.');
    }
  }, [toast]);

  const clearCart = useCallback(async () => {
    try {
      // Call API to clear cart in backend
      await apiService.clearCart();

      dispatch({ type: actionTypes.CLEAR_CART });
      localStorage.removeItem('localCart');

      toast.showSuccess('Cart cleared successfully!');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      toast.showError('Failed to clear cart. Please try again.');
    }
  }, [toast]);

  const clearCartLocal = useCallback(() => {
    // Clear cart without making API calls (used after successful payment)
    dispatch({ type: actionTypes.CLEAR_CART });
    localStorage.removeItem('localCart');
  }, []);

  const syncCartWithBackend = useCallback(async () => {
    // Sync frontend cart with backend (used to ensure consistency)
    if (!state.isAuthenticated) return;
    
    try {
      const cart = await apiService.getCart();
      dispatch({ type: actionTypes.SET_CART, payload: cart });
      
      const persistedItems = cart?.items ?? cart ?? [];
      if (persistedItems.length > 0) {
        localStorage.setItem('localCart', JSON.stringify(persistedItems));
      } else {
        localStorage.removeItem('localCart');
      }
    } catch (error) {
      console.warn('Failed to sync cart with backend:', error.message);
    }
  }, [state.isAuthenticated]);

  const fetchWishlist = useCallback(async () => {
    if (!state.isAuthenticated) {
      return;
    }
    try {
      const wishlist = await apiService.getWishlist();
      dispatch({ type: actionTypes.SET_WISHLIST, payload: wishlist });
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast?.showError?.('Failed to load wishlist. Please try again.');
    }
  }, [state.isAuthenticated, toast]);

  const addToWishlist = useCallback(async (item) => {
    if (!state.isAuthenticated) {
      toast?.showWarning?.('Please log in to add items to your wishlist.');
      return false;
    }

    const productId = item?.id ?? item?.product_id ?? item?.tshirt_id;
    if (!productId) {
      toast?.showError?.('Unable to add item to wishlist.');
      return false;
    }

    try {
      const response = await apiService.addToWishlist(productId);
      dispatch({ type: actionTypes.ADD_TO_WISHLIST, payload: response });
      toast?.showSuccess?.('Added to wishlist!');
      return true;
    } catch (error) {
      console.error('Failed to add item to wishlist:', error);
      toast?.showError?.('Failed to add to wishlist. Please try again.');
      return false;
    }
  }, [state.isAuthenticated, toast]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (!state.isAuthenticated) {
      toast?.showWarning?.('Please log in to manage your wishlist.');
      return false;
    }

    if (!productId) {
      return false;
    }

    try {
      await apiService.removeFromWishlist(productId);
      dispatch({ type: actionTypes.REMOVE_FROM_WISHLIST, payload: productId });
      toast?.showSuccess?.('Removed from wishlist.');
      return true;
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
      toast?.showError?.('Failed to remove from wishlist. Please try again.');
      return false;
    }
  }, [state.isAuthenticated, toast]);

  const clearWishlist = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_WISHLIST });
  }, []);

  const login = useCallback(async (user, token) => {
    localStorage.setItem('authToken', token);
    dispatch({ type: actionTypes.SET_USER, payload: user });

    // Load user's cart after successful login
    try {
      const cart = await apiService.getCart();
      dispatch({ type: actionTypes.SET_CART, payload: cart });
    } catch (error) {
      console.warn('Failed to load cart after login:', error.message);
      toast.showWarning('Welcome back! Your cart will be loaded when available.');
      // Don't set error state here as login was successful
    }

    try {
      const wishlist = await apiService.getWishlist();
      dispatch({ type: actionTypes.SET_WISHLIST, payload: wishlist });
    } catch (error) {
      console.warn('Failed to load wishlist after login:', error.message);
    }
  }, [toast]);

  const refreshAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No auth token found');
      }

      const user = await apiService.getProfile();
      dispatch({ type: actionTypes.SET_USER, payload: user });

      // Reload user's cart and wishlist
      try {
        const cart = await apiService.getCart();
        dispatch({ type: actionTypes.SET_CART, payload: cart });
      } catch (cartError) {
        console.warn('Failed to reload cart:', cartError.message);
      }

      try {
        const wishlist = await apiService.getWishlist();
        dispatch({ type: actionTypes.SET_WISHLIST, payload: wishlist });
      } catch (wishlistError) {
        console.warn('Failed to reload wishlist:', wishlistError.message);
      }

      return user;
    } catch (error) {
      console.error('Failed to refresh authentication:', error);

      // Only log out if it's specifically an auth error (401/403)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem('authToken');
        dispatch({ type: actionTypes.LOGOUT_USER });
      }

      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    dispatch({ type: actionTypes.LOGOUT_USER });
  }, []);

  const refreshProductData = useCallback(async () => {
    try {
      if (state.currentProduct?.id) {
        const updatedProduct = await apiService.getProduct(state.currentProduct.id);
        dispatch({ type: actionTypes.SET_CURRENT_PRODUCT, payload: updatedProduct });
      }
    } catch (error) {
      console.warn('Failed to refresh product data:', error);
    }
  }, [state.currentProduct?.id]);

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
    clearCartLocal,
    syncCartWithBackend,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    login,
    logout,
    refreshAuth,
    refreshProductData,
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
    clearCartLocal,
    syncCartWithBackend,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    login,
    logout,
    refreshAuth,
    refreshProductData,
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