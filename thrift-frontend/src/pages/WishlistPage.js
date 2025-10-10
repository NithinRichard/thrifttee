import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import ProductCard from '../components/product/ProductCard';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/media';
import EmptyState from '../components/ui/EmptyState';

const getDisplayValue = (value, fallback = 'N/A') => {
  if (!value) {
    return fallback;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  if (typeof value === 'object') {
    return value.name || value.title || value.label || value.slug || fallback;
  }

  return fallback;
};

const WishlistPage = () => {
  const { state, actions } = useApp();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.isAuthenticated) {
      loadWishlist();
    }
  }, [state.isAuthenticated]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      await actions.fetchWishlist();
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await actions.removeFromWishlist(productId);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-vintage font-bold text-gray-900 mb-4">
            Wishlist
          </h1>
          <p className="text-xl text-gray-500 mb-6">Please log in to view your wishlist</p>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-vintage font-bold text-gray-900">
              My Wishlist
            </h1>
            <div className="text-gray-600">
              {state.wishlist.length} {state.wishlist.length === 1 ? 'item' : 'items'}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="loading-spinner"></div>
            </div>
          ) : state.wishlist.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg"
            >
              <EmptyState
                icon="❤️"
                title="Your wishlist is empty"
                message="Save your favorite vintage finds for later and never miss out on unique pieces"
                ctaText="Discover Products"
                ctaLink="/products"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {state.wishlist.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden group relative"
                >
                  <div className="relative">
                    <Link to={`/products/${item.slug}`}>
                      <img
                        src={item.primary_image || item.image || DEFAULT_PRODUCT_IMAGE}
                        alt={item.title}
                        className="w-full h-64 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                      title="Remove from wishlist"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-4">
                    <Link to={`/products/${item.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-vintage-600 transition-colors">
                        {item.title}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-bold text-vintage-600">
                        ₹{item.price?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getDisplayValue(item.brand, 'Unknown')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Size: {item.size || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getDisplayValue(item.condition, 'N/A')}
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Link
                        to={`/products/${item.slug}`}
                        className="flex-1 btn-primary text-center"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => actions.addToCart(item)}
                        className="flex-1 btn-secondary"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default WishlistPage;
