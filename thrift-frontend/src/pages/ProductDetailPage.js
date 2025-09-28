
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';
import ProductCard from '../components/product/ProductCard';
import ConditionReport from '../components/product/ConditionReport';
import CReport from '../components/creport';
import ProductReviews from '../components/product/ProductReviews';
import { VintageCountdownTimer, VintageReservationWarning, VintageExpirationNotice } from '../components/reservation';
import useReservation from '../hooks/useReservation';
import { formatINR } from '../utils/currency';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/media';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { state, actions } = useApp();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [wishlistProcessing, setWishlistProcessing] = useState(false);
  const [showExpirationNotice, setShowExpirationNotice] = useState(false);
  const [error, setError] = useState(null);
  
  const { reservation, createReservation, extendReservation, loading, error: reservationError } = useReservation(product?.id);

  const getConditionBadgeClass = (condition) => {
    const badgeClasses = {
      'new_with_tags': 'bg-green-100 text-green-800 border-green-200',
      'new_without_tags': 'bg-green-100 text-green-800 border-green-200',
      'excellent': 'bg-blue-100 text-blue-800 border-blue-200',
      'very_good': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'good': 'bg-orange-100 text-orange-800 border-orange-200',
      'fair': 'bg-red-100 text-red-800 border-red-200',
      'poor': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return badgeClasses[condition] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getConditionDisplayText = (condition) => {
    const displayTexts = {
      'new_with_tags': 'New with Tags',
      'new_without_tags': 'New without Tags',
      'excellent': 'Excellent',
      'very_good': 'Very Good',
      'good': 'Good',
      'fair': 'Fair',
      'poor': 'Poor',
    };
    return displayTexts[condition] || condition?.replace('_', ' ')?.toUpperCase() || 'Unknown';
  };

  const isInWishlist = useMemo(() => {
    if (!product) {
      return false;
    }
    return (state.wishlist || []).some((item) => item.id === product.id);
  }, [state.wishlist, product?.id]);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        actions.setLoading(true);
        const productData = await apiService.getProductBySlug(slug);
        setProduct(productData);

        if (productData && productData.category) {
          const relatedData = await apiService.getProducts({
            category: productData.category.slug,
          });
          const relatedList = (relatedData.results || relatedData)
            .filter((p) => p.id !== productData.id)
            .slice(0, 4);
          setRelatedProducts(relatedList);
        }
      } catch (error) {
        actions.setError('Failed to load product details');
      } finally {
        actions.setLoading(false);
      }
    };

    loadProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]); // Remove actions from dependencies to prevent unnecessary re-runs

  const isAvailable = product?.is_available !== false && (product?.quantity > 0);

  const handleAddToCart = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAvailable) {
      setError('This item is currently out of stock');
      return;
    }
    if (product) {
      // Check if item is reserved by someone else
      if (reservation?.is_reserved && !reservation?.is_own_reservation) {
        setError('This item is currently held by another customer');
        return;
      }
      // Remove quantity from product to avoid confusion
      const { quantity: _, ...productWithoutQuantity } = product;
      await actions.addToCart(product); // Pass original product object, not productWithoutQuantity
    }
  };

  const handleToggleWishlist = async () => {
    if (!product || wishlistProcessing) {
      return;
    }

    setWishlistProcessing(true);
    try {
      if (isInWishlist) {
        await actions.removeFromWishlist(product.id);
      } else {
        await actions.addToWishlist(product);
      }
    } finally {
      setWishlistProcessing(false);
    }
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{state.error}</div>
        <Link to="/" className="btn-primary">
          Go to Homepage
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-xl mb-4">Product not found</div>
        <Link to="/products" className="btn-primary">
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <img
                  src={(product.all_images && product.all_images[0]) || product.primary_image || DEFAULT_PRODUCT_IMAGE}
                  alt={product.title}
                  className="w-full h-auto object-cover rounded-lg"
                />

                {/* Image Gallery Thumbnails */}
                {product.all_images && product.all_images.length > 1 && (
                  <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {product.all_images.slice(0, 8).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${product.title} - Image ${index + 1}`}
                        className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          // You could implement a lightbox or image switcher here
                          console.log(`Clicked image ${index + 1}`);
                        }}
                      />
                    ))}
                    {product.all_images.length > 8 && (
                      <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-600">
                        +{product.all_images.length - 8} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="text-4xl font-vintage font-bold text-gray-900 mb-4">
                {product.title}
              </h1>
              <div className="text-3xl font-bold text-vintage-600 mb-6">
                {formatINR(product.price)}
              </div>
              <p className="text-gray-700 text-lg mb-8">
                {product.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-bold text-gray-600">Category</div>
                  <div className="text-gray-800">
                    {typeof product.category === 'object' && product.category?.name
                      ? product.category.name
                      : product.category || 'N/A'}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-bold text-gray-600">Condition</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getConditionBadgeClass(product.condition)}`}>
                      {getConditionDisplayText(product.condition)}
                    </span>
                    {product.has_detailed_condition_info && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Detailed Report Available
                      </span>
                    )}
                  </div>
                  {product.condition_notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      "{product.condition_notes}"
                    </p>
                  )}
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-bold text-gray-600">Size</div>
                  <div className="text-gray-800">
                    {(() => {
                      if (typeof product.size === 'object' && product.size !== null) {
                        return product.size.name || product.size.value || 'N/A';
                      }
                      return product.size || 'N/A';
                    })()}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-bold text-gray-600">Brand</div>
                  <div className="text-gray-800">
                    {(() => {
                      if (typeof product.brand === 'object' && product.brand !== null) {
                        return product.brand.name || product.brand.title || 'N/A';
                      }
                      return product.brand || 'N/A';
                    })()}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-bold text-gray-600">Stock</div>
                  <div className="text-gray-800">
                    {reservation?.available_quantity !== undefined ? (
                      reservation.available_quantity > 1 ?
                        `${reservation.available_quantity} of ${reservation.total_quantity || product.quantity} available` :
                        reservation.available_quantity === 1 ?
                          `${reservation.available_quantity} of ${reservation.total_quantity || product.quantity} available` :
                          'Out of stock'
                    ) : (
                      isAvailable ?
                        (product.quantity > 1 ? `${product.quantity} available` : 'Unique item') :
                        'Out of Stock'
                    )}
                  </div>
                </div>
              </div>

              {/* Reservation Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
                  {error}
                </div>
              )}
              
              {/* Reservation System */}
              {reservation?.is_reserved && reservation?.is_own_reservation && (
                <div className="mb-6">
                  <VintageCountdownTimer
                    timeRemaining={reservation.time_remaining}
                    onExpire={() => setShowExpirationNotice(true)}
                    onExtend={extendReservation}
                    canExtend={reservation.extensions_used < 1}
                  />
                </div>
              )}
              
              {reservation?.is_reserved && !reservation?.is_own_reservation && (
                <div className="mb-6 relative">
                  <VintageReservationWarning
                    productName={product.title}
                    expiresAt={reservation.expires_at}
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {!reservation?.is_reserved ? (
                  <>
                    {state.isAuthenticated ? (
                      <button
                        onClick={createReservation}
                        disabled={loading || !isAvailable}
                        className={`w-full text-lg py-3 ${
                          loading || !isAvailable ? 'btn-disabled' : 'btn-secondary'
                        }`}
                      >
                        {loading ? 'Creating Hold...' : 'Hold Item (15 min)'}
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="btn-secondary w-full text-lg py-3 text-center inline-block"
                      >
                        Login to Hold Item
                      </Link>
                    )}
                    <button
                      onClick={handleAddToCart}
                      disabled={!isAvailable}
                      className={`w-full text-lg py-3 ${
                        isAvailable ? 'btn-primary' : 'btn-disabled'
                      }`}
                    >
                      {isAvailable ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </>
                ) : reservation?.is_own_reservation ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    className={`w-full text-lg py-3 ${
                      isAvailable ? 'btn-primary' : 'btn-disabled'
                    }`}
                  >
                    {isAvailable ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="btn-disabled w-full text-lg py-3"
                  >
                    Currently Held
                  </button>
                )}
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistProcessing}
                  className={`w-full text-lg py-3 rounded-lg font-semibold transition-colors duration-300 border ${isInWishlist ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'} ${wishlistProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {wishlistProcessing
                    ? 'Updating...'
                    : isInWishlist
                      ? 'Remove from Wishlist'
                      : 'Add to Wishlist'}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Condition Report Section */}
        {product && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12"
          >
            <CReport tshirt={product} />
          </motion.div>
        )}

        {/* Reviews Section */}
        {product && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12"
          >
            <ProductReviews productId={product.id} />
          </motion.div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-24"
          >
            <h2 className="text-3xl font-vintage font-bold text-gray-900 mb-8 text-center">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Expiration Notice Modal */}
        {showExpirationNotice && (
          <VintageExpirationNotice
            productName={product.title}
            onClose={() => setShowExpirationNotice(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
