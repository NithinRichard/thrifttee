import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_PRODUCT_IMAGE } from '../../utils/media';
import { formatINR } from '../../utils/currency';

const RecentlyViewed = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentItems(items.slice(0, 5));
  }, []);

  if (recentItems.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-vintage-600 text-white p-3 rounded-l-lg shadow-lg z-40 hover:bg-vintage-700 transition-colors"
      >
        <span className="text-sm font-semibold">Recently Viewed ({recentItems.length})</span>
      </button>

      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-vintage font-bold text-lg">Recently Viewed</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {recentItems.map((item, index) => (
              <Link
                key={index}
                to={`/products/${item.slug}`}
                className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <img
                  src={item.image || DEFAULT_PRODUCT_IMAGE}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                  <p className="text-vintage-600 font-bold">{formatINR(item.price)}</p>
                  <p className="text-xs text-gray-500">{typeof item.brand === 'object' ? item.brand?.name || 'Unknown' : item.brand || 'Unknown'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default RecentlyViewed;