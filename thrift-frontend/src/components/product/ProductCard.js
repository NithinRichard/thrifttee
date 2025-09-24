import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatINR } from '../../utils/currency';
import { DEFAULT_PRODUCT_IMAGE } from '../../utils/media';

const ProductCard = ({ product }) => {
  const { state, actions } = useApp();

  const isInWishlist = useMemo(() => {
    return (state.wishlist || []).some((item) => item.id === product.id);
  }, [state.wishlist, product.id]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    actions.addToCart(product);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      await actions.removeFromWishlist(product.id);
    } else {
      await actions.addToWishlist(product);
    }
  };

  const renderCategory = (category) => {
    if (typeof category === 'object' && category !== null) {
      return category.name || category.slug || 'Vintage';
    }
    return category || 'Vintage';
  };

  const renderProductValue = (value, fallback = 'N/A') => {
    if (typeof value === 'object' && value !== null) {
      return value.name || value.title || value.slug || fallback;
    }
    return value || fallback;
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <Link to={`/products/${product.slug}`}>
        <div className="relative overflow-hidden">
          <img
            src={(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}
            alt={product.title}
            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
          />

          {/* Overlay for quick actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 flex space-x-2">
              <button
                onClick={handleAddToCart}
                className="bg-white text-gray-900 px-3 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`bg-white ${isInWishlist ? 'text-red-500' : 'text-gray-900'} px-3 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors`}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isInWishlist ? '♥' : '♡'}
              </button>
            </div>
          </div>

          {/* Badges */}
          {product.is_featured && (
            <div className="absolute top-2 left-2 bg-vintage-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}
          {product.condition && (
            <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-full text-xs">
              {product.condition}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-vintage font-bold text-lg text-gray-900 mb-2 line-clamp-2">
            {product.title}
          </h3>

          <div className="flex justify-between items-center mb-3">
            <div className="text-2xl font-bold text-vintage-600">
              {formatINR(product.price)}
            </div>
            {product.original_price && (
              <div className="text-sm text-gray-500 line-through">
                {formatINR(product.original_price)}
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            {product.brand && (
              <div className="flex justify-between">
                <span className="font-semibold">Brand:</span>
                <span>{renderProductValue(product.brand, 'Unknown')}</span>
              </div>
            )}
            {product.size && (
              <div className="flex justify-between">
                <span className="font-semibold">Size:</span>
                <span>{renderProductValue(product.size, 'N/A')}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <div className="flex text-yellow-400">
                {'★'.repeat(Math.floor(product.rating || 4.5))}
                {'☆'.repeat(5 - Math.floor(product.rating || 4.5))}
              </div>
              <span className="text-sm text-gray-600 ml-1">
                ({product.review_count || 0})
              </span>
            </div>

            <span className="text-xs text-gray-500">
              {renderCategory(product.category)}
            </span>
          </div>
        </div>
      </Link>

      {/* Quick action buttons */}
      <div className="px-4 pb-4 flex space-x-2">
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-vintage-600 text-white py-2 rounded-lg font-semibold hover:bg-vintage-700 transition-colors duration-300"
        >
          Add to Cart
        </button>
        <button
          onClick={handleToggleWishlist}
          className={`px-3 py-2 border border-gray-300 rounded-lg transition-colors duration-300 ${isInWishlist ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'hover:bg-gray-50 text-gray-700'}`}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isInWishlist ? '♥' : '♡'}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
