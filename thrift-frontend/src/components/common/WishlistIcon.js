import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';

const WishlistIcon = () => {
  const { state } = useApp();

  return (
    <Link
      to="/wishlist"
      className="relative p-2 text-gray-700 hover:text-vintage-600 transition-colors"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {state.wishlistCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-vintage-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {state.wishlistCount > 99 ? '99+' : state.wishlistCount}
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
};

export default WishlistIcon;
