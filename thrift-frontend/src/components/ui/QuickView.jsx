import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import { formatINR } from '../../utils/currency';
import { DEFAULT_PRODUCT_IMAGE } from '../../utils/media';


const QuickView = ({ product, isOpen, onClose }) => {
  const { actions } = useApp();
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) return null;

  const images = product.all_images || [product.primary_image || DEFAULT_PRODUCT_IMAGE];
  const isAvailable = product.is_available !== false && product.quantity > 0;

  const handleAddToCart = () => {
    if (isAvailable) {
      actions.addToCart(product);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-white rounded-full p-1.5 md:p-2 shadow-lg hover:bg-gray-100"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6">
              {/* Images */}
              <div>
                <img
                  src={images[selectedImage]}
                  alt={product.title}
                  className="w-full h-64 md:h-80 object-cover rounded-lg mb-3 md:mb-4"
                />
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded border-2 overflow-hidden ${
                          selectedImage === index ? 'border-vintage-600' : 'border-gray-200'
                        }`}
                      >
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-3 md:space-y-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-vintage font-bold text-gray-900 mb-2">
                    {product.title}
                  </h2>
                  <div className="text-2xl md:text-3xl font-bold text-vintage-600 mb-3 md:mb-4">
                    {formatINR(product.price)}
                  </div>
                </div>

                {product.description && (
                  <p className="text-sm md:text-base text-gray-700">{product.description}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-sm">
                  {product.brand && (
                    <div>
                      <span className="font-semibold">Brand:</span>
                      <span className="ml-2">{typeof product.brand === 'object' ? product.brand.name : product.brand}</span>
                    </div>
                  )}
                  {product.size && (
                    <div>
                      <span className="font-semibold">Size:</span>
                      <span className="ml-2">{typeof product.size === 'object' ? product.size.name : product.size}</span>
                    </div>
                  )}
                  {product.condition && (
                    <div className="col-span-1 sm:col-span-2">
                      <span className="font-semibold">Condition:</span>
                      <span className="ml-2">{typeof product.condition === 'object' ? product.condition.name : product.condition}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-3 md:pt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    className={`flex-1 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base ${
                      isAvailable
                        ? 'bg-vintage-600 text-white hover:bg-vintage-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isAvailable ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  <button
                    onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                    className="px-4 md:px-6 py-2.5 md:py-3 border border-vintage-600 text-vintage-600 rounded-lg hover:bg-vintage-50 text-sm md:text-base"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickView;