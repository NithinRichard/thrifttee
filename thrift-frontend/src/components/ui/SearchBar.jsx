import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

const SearchBar = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await apiService.get(`/products/?search=${query}`);
        setResults(response.results?.slice(0, 5) || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${query}`);
      setShowResults(false);
      setQuery('');
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="search"
            placeholder="Search vintage tees..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vintage-600"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </form>

      {showResults && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg mt-2 max-h-96 overflow-y-auto z-50 border">
          {loading ? (
            <div className="p-4 text-center text-gray-600">Searching...</div>
          ) : results.length > 0 ? (
            <>
              {results.map(product => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  onClick={() => {
                    setShowResults(false);
                    setQuery('');
                  }}
                  className="flex gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <img 
                    src={product.images?.[0]?.image || '/placeholder.jpg'} 
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.title}</p>
                    <p className="text-sm text-gray-600">{product.brand?.name}</p>
                    <p className="text-sm font-semibold text-vintage-600">₹{product.price}</p>
                  </div>
                </Link>
              ))}
              <button
                onClick={() => {
                  navigate(`/products?search=${query}`);
                  setShowResults(false);
                  setQuery('');
                }}
                className="w-full p-3 text-center text-vintage-600 hover:bg-gray-50 font-medium"
              >
                View all results →
              </button>
            </>
          ) : (
            <div className="p-4 text-center text-gray-600">No products found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
