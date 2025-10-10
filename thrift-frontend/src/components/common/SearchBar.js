import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';
import apiService from '../../services/api';

const SearchBar = () => {
  const { state, actions } = useApp();
  const [localQuery, setLocalQuery] = useState(state.searchQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    setLocalQuery(state.searchQuery);
  }, [state.searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiService.getProducts({
        search: query,
        page_size: 5
      });
      setSearchResults(response.results || response || []);
    } catch (error) {
      console.warn('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useMemo(() => debounce(performSearch, 500), []);

  useEffect(() => {
    if (localQuery.length >= 2) {
      debouncedSearch(localQuery);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [localQuery, debouncedSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      // Only update global state if the query is different from current state
      if (localQuery.trim() !== state.searchQuery) {
        actions.setSearchQuery(localQuery);
      }
      setShowResults(false);
      navigate('/products');
    }
  };

  const handleResultClick = (product) => {
    setLocalQuery(product.title);
    actions.setSearchQuery(product.title);
    setShowResults(false);
    navigate(`/products/${product.slug}`);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search for t-shirts..."
          className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-500 focus:border-transparent transition-all duration-200"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-vintage-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && (searchResults.length > 0 || isSearching) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {isSearching && (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-vintage-600"></div>
                  <span>Searching...</span>
                </div>
              </div>
            )}

            {searchResults.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleResultClick(product)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={product.primary_image || '/placeholder-image.jpg'}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {product.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      ₹{product.price}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {searchResults.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={handleSubmit}
                  className="w-full text-center text-vintage-600 hover:text-vintage-700 font-medium py-2"
                >
                  View all results for "{localQuery}"
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default SearchBar;