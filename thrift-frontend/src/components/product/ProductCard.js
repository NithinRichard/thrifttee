import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import QuickView from '../ui/QuickView';
import { formatINR } from '../../utils/currency';
import { DEFAULT_PRODUCT_IMAGE } from '../../utils/media';

const ProductCard = ({ product }) => {
  const { state, actions } = useApp();
  const [showQuickView, setShowQuickView] = useState(false);

  const isInWishlist = useMemo(() => {
    return (state.wishlist || []).some((item) => item.id === product.id);
  }, [state.wishlist, product.id]);

  const isAvailable = product.is_available !== false && (product.quantity > 0);

  const handleAddToCart = (e) => {
    if (!isAvailable) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
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
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
    >
      <Link to={`/products/${product.slug}`}>
        <div className="relative overflow-hidden">
          <img
            src={(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}
            alt={product.title}
            className="w-full h-48 sm:h-56 md:h-64 object-cover object-center hover:scale-105 transition-transform duration-300"
          />

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickView(true);
            }}
            className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-full shadow-md transition-all duration-200 z-10"
            aria-label="Quick view"
          >
            👁️
          </button>

          {/* Badges */}
          {product.is_featured && (
            <div className="absolute top-2 left-2 bg-vintage-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}
          {!isAvailable && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Out of Stock
            </div>
          )}
          {product.condition && isAvailable && (
            <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-full text-xs">
              {product.condition}
            </div>
          )}
        </div>

        <div className="p-3 md:p-4">
          <h3 className="font-vintage font-bold text-base md:text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3rem] md:min-h-[3.5rem]">
            {product.title}
          </h3>

          <div className="flex justify-between items-center mb-3">
            <div className={`text-xl md:text-2xl font-bold ${!isAvailable ? 'text-gray-400 line-through' : 'text-vintage-600'}`}>
              {formatINR(product.price)}
            </div>
            {product.original_price && isAvailable && (
              <div className="text-sm text-gray-500 line-through">
                {formatINR(product.original_price)}
              </div>
            )}
            {!isAvailable && (
              <div className="text-sm text-red-600 font-semibold">
                Out of Stock
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

          <div className="mt-3 md:mt-4 flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <div className="flex text-yellow-400 text-sm">
                {'★'.repeat(Math.floor(product.rating || 4.5))}
                {'☆'.repeat(5 - Math.floor(product.rating || 4.5))}
              </div>
              <span className="text-xs md:text-sm text-gray-600 ml-1">
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
      <div className="px-3 md:px-4 pb-3 md:pb-4 flex gap-2">
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors text-sm ${
            isAvailable
              ? 'bg-vintage-600 text-white hover:bg-vintage-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAvailable ? 'Add to Cart' : 'Out of Stock'}
        </button>
        <button
          onClick={handleToggleWishlist}
          className={`px-3 py-2.5 border border-gray-300 rounded-lg transition-colors flex items-center justify-center ${isInWishlist ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'hover:bg-gray-50 text-gray-700'}`}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <span className="text-lg">{isInWishlist ? '♥' : '♡'}</span>
        </button>
      </div>
      
      <QuickView
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </motion.div>
  );
};

export default ProductCard;
