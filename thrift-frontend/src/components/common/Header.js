import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import SearchBar from '../ui/SearchBar';
import CartIcon from './CartIcon';
import WishlistIcon from './WishlistIcon';

const Header = ({ onCartClick }) => {
  const { state, actions } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    actions.logout();
    navigate('/');
  };

  return (
    <>
      <motion.header
        className="bg-white shadow-md sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-vintage font-bold text-vintage-700"
              >
                ThriftTees
              </motion.div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchBar />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/products"
                className="text-gray-700 hover:text-vintage-600 transition-colors"
              >
                Shop
              </Link>

              {state.isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-vintage-600 transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-vintage-600 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-vintage-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {state.isAuthenticated && <WishlistIcon />}
              <CartIcon onCartClick={onCartClick} />
            </nav>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center space-x-2">
              {/* Mobile Search Button */}
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="touch-target bg-transparent border-none p-2 text-gray-600 hover:text-vintage-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {state.isAuthenticated && <WishlistIcon />}
              <CartIcon onCartClick={onCartClick} />

              {/* Mobile menu button */}
              <button
                className="touch-target bg-transparent border-none p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              <div className="flex flex-col space-y-4">
                <Link to="/products" className="text-gray-700 hover:text-vintage-600">
                  Shop
                </Link>
                {state.isAuthenticated ? (
                  <>
                    <Link to="/cart" className="text-gray-700 hover:text-vintage-600">
                      Cart ({state.cartCount})
                    </Link>
                    <Link to="/profile" className="text-gray-700 hover:text-vintage-600">
                      Profile
                    </Link>
                    <button onClick={handleLogout} className="text-left text-gray-700 hover:text-vintage-600">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-700 hover:text-vintage-600">
                      Login
                    </Link>
                    <Link to="/register" className="text-gray-700 hover:text-vintage-600">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Persistent Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsMobileSearchOpen(false)}
            />

            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 p-4"
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="touch-target bg-transparent border-none p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex-1">
                  <SearchBar />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;