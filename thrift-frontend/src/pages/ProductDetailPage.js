
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
import ImageZoom from '../components/ui/ImageZoom';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { formatINR } from '../utils/currency';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/media';
import { normalizeSize, estimateFromMeasurements, formatSizingAdvice } from '../utils/sizing';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import UrgencyIndicators from '../components/ui/UrgencyIndicators';
import StickyMobileCart from '../components/product/StickyMobileCart';
import RecommendedProducts from '../components/product/RecommendedProducts';
import SocialShare from '../components/common/SocialShare';
import { ProductDetailSkeleton } from '../components/ui/LoadingSkeleton';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { state, actions } = useApp();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [wishlistProcessing, setWishlistProcessing] = useState(false);
  const [showExpirationNotice, setShowExpirationNotice] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [error, setError] = useState(null);
  
  const { reservation, createReservation, extendReservation, loading, error: reservationError } = useReservation(product?.id);
  
  useRecentlyViewed(product, state.user?.id);

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

  const [productState, setProductState] = useState(product);
  const isAvailable = productState?.is_available !== false && (productState?.quantity > 0);
  
  useEffect(() => {
    setProductState(product);
  }, [product]);

  // Sizing normalization and measurement-based estimate
  const normalizedSize = useMemo(() => {
    if (!product) return null;
    const era = Array.isArray(product?.tags) ? product.tags.join(' ') : (product?.tags || '');
    const brandName = typeof product?.brand === 'object' && product?.brand !== null ? (product.brand.name || product.brand.title) : product?.brand;
    return normalizeSize({
      label: typeof product?.size === 'object' && product?.size !== null ? (product.size.name || product.size.value) : product?.size,
      gender: product?.gender,
      era,
      brand: brandName,
    });
  }, [product]);

  const measurementEstimate = useMemo(() => {
    if (!product) return null;
    return estimateFromMeasurements({
      pitToPit: product?.pit_to_pit,
      shoulderToShoulder: product?.shoulder_to_shoulder,
      frontLength: product?.front_length,
      sleeveLength: product?.sleeve_length,
      gender: product?.gender,
    });
  }, [product]);

  const sizingAdvice = useMemo(() => {
    return formatSizingAdvice({ normalized: normalizedSize, measurementEstimate });
  }, [normalizedSize, measurementEstimate]);

  const handleAddToCart = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAvailable) {
      setError('This item is currently out of stock');
      return;
    }
    if (productState) {
      // Check if item is reserved by someone else
      if (reservation?.is_reserved && !reservation?.is_own_reservation) {
        setError('This item is currently held by another customer');
        return;
      }
      
      try {
        await actions.addToCart(productState);
        // Refresh product data after successful add to cart
        const updatedProduct = await apiService.getProductBySlug(slug);
        setProductState(updatedProduct);
      } catch (error) {
        // Error is already handled in AppContext with toast
        // Refresh product data to get updated stock info
        try {
          const updatedProduct = await apiService.getProductBySlug(slug);
          setProductState(updatedProduct);
        } catch (refreshError) {
          console.warn('Failed to refresh product data:', refreshError);
        }
      }
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
      <div className="container mx-auto px-4 py-8">
        <ProductDetailSkeleton />
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
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Products', link: '/products' },
          { label: product.category?.name || 'Category', link: `/products?category=${product.category?.slug}` },
          { label: product.title }
        ]} />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}

            >
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <ImageZoom
                  src={(product.all_images && product.all_images[0]) || product.primary_image || DEFAULT_PRODUCT_IMAGE}
                  alt={product.title}
                  className="w-full h-96 rounded-lg"
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
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-vintage font-bold text-gray-900 mb-4">
                  {product.title}
                </h1>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-vintage-600">
                    {formatINR(product.price)}
                  </div>
                  <SocialShare
                    url={window.location.href}
                    title={product.title}
                    image={product.primary_image || product.all_images?.[0]}
                  />
                </div>
                {sizingAdvice && (
                  <div className="text-sm text-gray-600 mb-4">
                    {sizingAdvice}
                  </div>
                )}
                
                {/* Urgency Indicators */}
                <div className="mb-4">
                  <UrgencyIndicators product={product} />
                </div>
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
                  <div className="font-bold text-gray-600">Size Guide</div>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-vintage-600 hover:text-vintage-700 text-sm font-medium"
                  >
                    View Size Chart →
                  </button>
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
                        `${reservation.available_quantity} of ${reservation.total_quantity || productState.quantity} available` :
                        reservation.available_quantity === 1 ?
                          `${reservation.available_quantity} of ${reservation.total_quantity || productState.quantity} available` :
                          'Out of stock'
                    ) : (
                      isAvailable ?
                        (productState.quantity > 1 ? `${productState.quantity} available` : 'Unique item') :
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

        {/* Recommended Products */}
        <RecommendedProducts currentProduct={product} />
        
        {/* Sticky Mobile Cart */}
        <StickyMobileCart 
          product={product}
          onAddToCart={handleAddToCart}
          loading={!isAvailable}
        />

        {/* Size Guide Modal */}
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSizeGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-vintage font-bold text-gray-900">
                    Size Guide
                  </h3>
                  <button
                    onClick={() => setShowSizeGuide(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Sizing Summary using utilities */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-semibold">Label:</span> {(() => {
                      if (typeof product.size === 'object' && product.size !== null) {
                        return product.size.name || product.size.value || 'N/A';
                      }
                      return product.size || 'N/A';
                    })()}</div>
                    <div><span className="font-semibold">Standardized:</span> {normalizedSize?.us || 'Unknown'}</div>
                    <div><span className="font-semibold">Suggested fit:</span> {normalizedSize?.suggested || '—'}</div>
                    {measurementEstimate && (
                      <div><span className="font-semibold">Estimate from measurements:</span> {measurementEstimate}</div>
                    )}
                  </div>
                  {(product.pit_to_pit || product.front_length || product.shoulder_to_shoulder) && (
                    <div className="mt-3 text-xs text-gray-600">
                      {product.pit_to_pit && (<div>Pit-to-pit: {product.pit_to_pit}"</div>)}
                      {product.front_length && (<div>Length: {product.front_length}"</div>)}
                      {product.shoulder_to_shoulder && (<div>Shoulder: {product.shoulder_to_shoulder}"</div>)}
                    </div>
                  )}
                  {normalizedSize?.notes?.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">{normalizedSize.notes.join(' ')}</div>
                  )}
                </div>

                {/* Size Chart Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Size</th>
                        <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Chest (inches)</th>
                        <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Length (inches)</th>
                        <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Shoulder (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 px-4 py-3 font-medium">XS</td>
                        <td className="border border-gray-200 px-4 py-3">34-36</td>
                        <td className="border border-gray-200 px-4 py-3">25-26</td>
                        <td className="border border-gray-200 px-4 py-3">16-17</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium">S</td>
                        <td className="border border-gray-200 px-4 py-3">36-38</td>
                        <td className="border border-gray-200 px-4 py-3">26-27</td>
                        <td className="border border-gray-200 px-4 py-3">17-18</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-4 py-3 font-medium">M</td>
                        <td className="border border-gray-200 px-4 py-3">38-40</td>
                        <td className="border border-gray-200 px-4 py-3">27-28</td>
                        <td className="border border-gray-200 px-4 py-3">18-19</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium">L</td>
                        <td className="border border-gray-200 px-4 py-3">40-42</td>
                        <td className="border border-gray-200 px-4 py-3">28-29</td>
                        <td className="border border-gray-200 px-4 py-3">19-20</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-4 py-3 font-medium">XL</td>
                        <td className="border border-gray-200 px-4 py-3">42-44</td>
                        <td className="border border-gray-200 px-4 py-3">29-30</td>
                        <td className="border border-gray-200 px-4 py-3">20-21</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium">XXL</td>
                        <td className="border border-gray-200 px-4 py-3">44-46</td>
                        <td className="border border-gray-200 px-4 py-3">30-31</td>
                        <td className="border border-gray-200 px-4 py-3">21-22</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">How to Measure</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Chest:</strong> Measure around the fullest part of your chest</li>
                    <li>• <strong>Length:</strong> Measure from the highest point of the shoulder to the bottom hem</li>
                    <li>• <strong>Shoulder:</strong> Measure from one shoulder seam to the other</li>
                  </ul>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Still unsure about sizing? <a href="/contact" className="text-vintage-600 hover:text-vintage-700 font-medium">Contact our styling experts</a>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailPage;

