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
      className="mobile-product-card group"
    >
      <Link to={`/products/${product.slug}`}>
        <div className="relative overflow-hidden rounded-lg">
          {/* Responsive Image with multiple sizes */}
          <picture className="mobile-product-image">
            {/* WebP format for modern browsers */}
            <source
              media="(min-width: 1024px)"
              srcSet={`${(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}?w=300&h=375&f=webp 1x, ${(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}?w=600&h=750&f=webp 2x`}
              type="image/webp"
            />
            <source
              media="(min-width: 768px)"
              srcSet={`${(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}?w=250&h=312&f=webp 1x, ${(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}?w=500&h=625&f=webp 2x`}
              type="image/webp"
            />
            <source
              media="(min-width: 640px)"
              srcSet={`${(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}?w=200&h=250&f=webp 1x, ${(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}?w=400&h=500&f=webp 2x`}
              type="image/webp"
            />
            {/* Fallback for older browsers */}
            <source
              media="(min-width: 1024px)"
              srcSet={`${(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}?w=300&h=375 1x, ${(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}?w=600&h=750 2x`}
            />
            <source
              media="(min-width: 768px)"
              srcSet={`${(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}?w=250&h=312 1x, ${(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}?w=500&h=625 2x`}
            />
            <source
              media="(min-width: 640px)"
              srcSet={`${(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}?w=200&h=250 1x, ${(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}?w=400&h=500 2x`}
            />
            <img
              src={(product.primary_image || (product.all_images && product.all_images[0])) || DEFAULT_PRODUCT_IMAGE}
              alt={product.title}
              className="mobile-product-image"
              loading="lazy"
            />
          </picture>

          {/* Badges */}
          {product.is_featured && (
            <div className="absolute top-2 left-2 bg-vintage-600 text-white px-2 py-1 rounded-full mobile-text-xs font-semibold">
              Featured
            </div>
          )}
          {!isAvailable && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full mobile-text-xs font-semibold">
              Out of Stock
            </div>
          )}
          {product.condition && isAvailable && (
            <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-full mobile-text-xs">
              {product.condition}
            </div>
          )}
        </div>

        <div className="mobile-spacing-sm">
          <h3 className="mobile-product-title">
            {product.title}
          </h3>

          <div className="flex justify-between items-center mb-3">
            <div className={`mobile-product-price ${!isAvailable ? 'text-gray-400 line-through' : ''}`}>
              {formatINR(product.price)}
            </div>
            {product.original_price && isAvailable && (
              <div className="mobile-text-sm text-gray-500 line-through">
                {formatINR(product.original_price)}
              </div>
            )}
            {!isAvailable && (
              <div className="mobile-text-sm text-red-600 font-semibold">
                Out of Stock
              </div>
            )}
          </div>

          <div className="mobile-text-sm text-gray-600 space-y-1">
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

          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <div className="flex text-yellow-400 mobile-text-sm">
                {'★'.repeat(Math.floor(product.rating || 4.5))}
                {'☆'.repeat(5 - Math.floor(product.rating || 4.5))}
              </div>
              <span className="mobile-text-xs text-gray-600 ml-1">
                ({product.review_count || 0})
              </span>
            </div>

            <span className="mobile-text-xs text-gray-500">
              {renderCategory(product.category)}
            </span>
          </div>
        </div>
      </Link>

      {/* Quick action buttons */}
      <div className="mobile-spacing-sm flex gap-2">
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`mobile-button flex-1 mobile-text-sm ${isAvailable ? 'mobile-button-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          {isAvailable ? 'Add to Cart' : 'Out of Stock'}
        </button>
        <button
          onClick={handleToggleWishlist}
          className={`mobile-button px-3 mobile-text-sm border border-gray-300 rounded-lg transition-colors flex items-center justify-center ${isInWishlist ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'hover:bg-gray-50 text-gray-700'}`}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <span className="text-lg">{isInWishlist ? '♥' : '♡'}</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
