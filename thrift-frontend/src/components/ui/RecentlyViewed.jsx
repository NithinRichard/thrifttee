import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_PRODUCT_IMAGE } from '../../utils/media';
import { formatINR } from '../../utils/currency';
import { getRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { useApp } from '../../contexts/AppContext';

const RecentlyViewed = () => {
  const { state } = useApp();
  const userId = state?.user?.id || null;
  const [recentItems, setRecentItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load user-specific or guest recently viewed when user changes
    const items = getRecentlyViewed(userId);
    setRecentItems(items.slice(0, 5));
  }, [userId]);

  if (recentItems.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 bg-vintage-600 text-white p-3 rounded-full shadow-lg hover:bg-vintage-700 transition-colors z-40"
        title="Recently Viewed"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {recentItems.length}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-vintage font-bold text-gray-900">
                    Recently Viewed
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {recentItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/products/${item.slug}`}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <img
                        src={item.image || DEFAULT_PRODUCT_IMAGE}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {item.brand && `${item.brand} • `}
                          {formatINR(item.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Link
                    to="/products"
                    className="block w-full text-center bg-vintage-600 text-white py-2 rounded-lg hover:bg-vintage-700 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    View All Products
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RecentlyViewed;