import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { motion } from 'framer-motion';
import { submitSavedSearchToBackend } from '../utils/savedSearches';
import ProductCard from '../components/product/ProductCard';
import ProductFilters from '../components/product/ProductFilters';
import SearchBar from '../components/common/SearchBar';
import AdvancedSearch from '../components/search/AdvancedSearch';
import apiService from '../services/api';
import { ProductGridSkeleton, FiltersSkeleton } from '../components/ui/SkeletonLoading';
import EmptyState from '../components/ui/EmptyState';

const ProductsPage = () => {
  const { state, actions } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('-created_at');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const debounceRef = useRef(null);

  // Memoize the debounced load function to prevent unnecessary re-renders
  const debouncedLoadProducts = useMemo(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        loadProducts();
      }, 500); // Increased to 500ms for main products page
    };
  }, []);

  // Initial load effect
  useEffect(() => {
    loadProducts();
  }, []); // Only run on mount

  useEffect(() => {
    // Only load products if we have filters, search query, or are on a specific page/sort
    // This prevents unnecessary API calls on initial mount
    const shouldLoadProducts = state.filters && Object.keys(state.filters).length > 0 ||
                              state.searchQuery ||
                              currentPage > 1 ||
                              sortBy !== '-created_at';

    if (shouldLoadProducts) {
      debouncedLoadProducts();
    }

    // Cleanup function
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [state.filters, state.searchQuery, currentPage, sortBy, debouncedLoadProducts]);

  const loadProducts = async () => {
    try {
      actions.setLoading(true);
      let params = {
        ...state.filters,
        search: state.searchQuery,
        page: currentPage,
        ordering: sortBy,
      };

      // Convert price_range to min_price and max_price for better backend compatibility
      if (params.price_range && params.price_range !== 'all') {
        const [minPrice, maxPrice] = params.price_range.split('-');
        params.min_price = minPrice;
        params.max_price = maxPrice === '+' ? undefined : maxPrice;
        delete params.price_range;
      }

      const response = await apiService.getProducts(params);
      actions.setProducts(response.results || response);

      if (response.count) {
        setTotalPages(Math.ceil(response.count / 20));
      }
    } catch (error) {
      actions.setError('Failed to load products');
    } finally {
      actions.setLoading(false);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show loading state with skeletons
  if (state.loading && (!state.products || state.products.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="h-10 bg-gray-300 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-300 rounded w-2/3 mx-auto mb-8 animate-pulse"></div>
              <div className="h-12 bg-gray-300 rounded w-1/2 mx-auto animate-pulse"></div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar Skeleton */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:w-1/4"
            >
              <FiltersSkeleton />
            </motion.div>

            {/* Products Grid Skeleton */}
            <div className="lg:w-3/4">
              <ProductGridSkeleton count={8} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-vintage font-bold text-gray-900 mb-4">
              Our Collection
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Browse our curated selection of vintage and pre-owned t-shirts
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <SearchBar />
              <button
                onClick={() => setShowAdvancedSearch(true)}
                className="mt-2 text-sm text-vintage-600 hover:text-vintage-700 underline"
              >
                Advanced Search
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/4"
          >
            <ProductFilters />
          </motion.div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Sort and Results Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-between items-center mb-6"
            >
              <div className="text-gray-600">
                {state.products?.length > 0 ? (
                  <>Showing {state.products.length} products</>
                ) : (
                  <>No products found</>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vintage-500"
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="-price">Price: High to Low</option>
                <option value="price">Price: Low to High</option>
                <option value="title">Name: A to Z</option>
                <option value="-title">Name: Z to A</option>
              </select>
            </motion.div>

            {/* Products Grid or Zero Results */}
            {state.products?.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {state.products?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 text-center max-w-2xl mx-auto"
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-vintage font-bold text-gray-900 mb-2">No results found</div>
                  <p className="text-gray-600">Try adjusting your filters or search terms. You can also get notified when matching items are available.</p>
                </div>

                {/* Notify Me Capture */}
                <div className="mb-8">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Get Notified</h3>
                    <p className="text-sm text-gray-600 mb-4">Enter your email and we'll let you know when items matching your search become available.</p>
                    <form
                      className="flex flex-col sm:flex-row gap-2"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const email = e.target.elements.notify_email?.value;
                        const searchQuery = state.filters?.search || '';

                        try {
                          const success = await submitSavedSearchToBackend(email, searchQuery, state.filters);

                          if (success) {
                            // Show success message with better UX
                            const message = `✅ We'll notify ${email} when items matching "${searchQuery || 'your search'}" become available!`;
                            alert(message);

                            // You could also show a toast notification here instead of alert
                            // toast.showSuccess(`Saved search notification for ${email}`);

                            e.target.reset();
                          } else {
                            alert('❌ Failed to save notification. Please try again.');
                          }
                        } catch (error) {
                          console.error('Error saving search notification:', error);
                          alert('❌ Failed to save notification. Please check your connection and try again.');
                        }
                      }}
                    >
                      <input
                        type="email"
                        name="notify_email"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-vintage-500"
                        placeholder="Enter your email address"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-vintage-600 text-white rounded-md hover:bg-vintage-700 focus:outline-none focus:ring-2 focus:ring-vintage-500 whitespace-nowrap"
                      >
                        Notify Me
                      </button>
                    </form>
                  </div>
                </div>

                {/* Popular Quick Filters */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Searches</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      'Vintage 90s', 'Champion', 'Graphic Tee', 'Oversized', 'Cotton',
                      'Nike', 'Adidas', 'Levi\'s', 'Band Tee', 'Streetwear',
                      'Vintage Denim', 'Hoodie', 'Sweatshirt', 'Polo', 'Designer'
                    ].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          actions.setSearchQuery(tag);
                          actions.setFilters({ ...state.filters, search: tag });
                        }}
                        className="px-3 py-1 bg-gray-100 hover:bg-vintage-100 hover:border-vintage-300 border border-gray-200 rounded-full text-sm text-gray-800 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Browse Suggestions */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse Categories</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {[
                      { name: 'All Items', action: () => actions.setFilters({}) },
                      { name: 'T-Shirts', action: () => actions.setFilters({ category: 'tshirt' }) },
                      { name: 'Hoodies', action: () => actions.setFilters({ category: 'hoodie' }) },
                      { name: 'Vintage', action: () => actions.setSearchQuery('vintage') },
                      { name: 'New Arrivals', action: () => actions.setFilters({ sort: 'newest' }) },
                      { name: 'Under ₹1000', action: () => actions.setFilters({ maxPrice: 1000 }) }
                    ].map((category) => (
                      <button
                        key={category.name}
                        onClick={category.action}
                        className="px-3 py-2 bg-gray-50 hover:bg-vintage-50 border border-gray-200 rounded-md text-sm text-gray-700 hover:text-vintage-700 transition-colors"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Popular brands: </span>
                    <button className="text-vintage-600 hover:text-vintage-700 mx-1" onClick={() => actions.setSearchQuery('Nike')}>Nike</button>
                    <span className="text-gray-400">·</span>
                    <button className="text-vintage-600 hover:text-vintage-700 mx-1" onClick={() => actions.setSearchQuery('Adidas')}>Adidas</button>
                    <span className="text-gray-400">·</span>
                    <button className="text-vintage-600 hover:text-vintage-700 mx-1" onClick={() => actions.setSearchQuery('Levi')}>Levi's</button>
                    <span className="text-gray-400">·</span>
                    <button className="text-vintage-600 hover:text-vintage-700 mx-1" onClick={() => actions.setSearchQuery('Champion')}>Champion</button>
                    <span className="text-gray-400">·</span>
                    <button className="text-vintage-600 hover:text-vintage-700 mx-1" onClick={() => actions.setSearchQuery('Vintage')}>More</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex justify-center mt-12 space-x-2"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 border rounded-md transition-colors ${
                        pageNum === currentPage
                          ? 'bg-vintage-600 text-white border-vintage-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <AdvancedSearch
          onSearch={(filters) => {
            actions.setFilters(filters);
            if (filters.search) actions.setSearchQuery(filters.search);
          }}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}
    </div>
  );
};

export default ProductsPage;