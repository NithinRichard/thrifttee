import React, { useState, useEffect } from 'react';

const StickyMobileCart = ({ product, onAddToCart, loading }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40 md:hidden animate-slide-up">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg text-gray-900">₹{product.price}</p>
          <p className="text-sm text-gray-600 truncate">{product.title}</p>
        </div>
        <button
          onClick={onAddToCart}
          disabled={loading || product.stock === 0}
          className="bg-vintage-600 hover:bg-vintage-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'Adding...' : product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default StickyMobileCart;
