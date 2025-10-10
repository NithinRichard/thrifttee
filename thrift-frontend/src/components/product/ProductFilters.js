import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';

const ProductFilters = () => {
  const { state, actions } = useApp();
  const debounceRef = useRef({});

  const handleFilterChange = useCallback((filterType, value) => {
    const newFilters = { ...state.filters };

    if (value === '' || value === 'all') {
      delete newFilters[filterType];
    } else {
      newFilters[filterType] = value;
    }

    // Clear existing debounce timer for this filter type
    if (debounceRef.current[filterType]) {
      clearTimeout(debounceRef.current[filterType]);
    }

    // Set new debounce timer
    debounceRef.current[filterType] = setTimeout(() => {
      actions.setFilters(newFilters);
      delete debounceRef.current[filterType];
    }, 300); // 300ms debounce delay
  }, [state.filters, actions]);

  const clearAllFilters = () => {
    // Clear all debounce timers
    Object.values(debounceRef.current).forEach(timer => clearTimeout(timer));
    debounceRef.current = {};
    actions.setFilters({});
  };

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceRef.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const filterOptions = {
    category: [
      { value: 'all', label: 'All Categories' },
      { value: 'band', label: 'Band Tees' },
      { value: 'sports', label: 'Sports' },
      { value: 'vintage', label: 'Vintage' },
      { value: 'designer', label: 'Designer' },
      { value: 'graphic', label: 'Graphic Tees' }
    ],
    size: [
      { value: 'all', label: 'All Sizes' },
      { value: 'xs', label: 'XS' },
      { value: 's', label: 'S' },
      { value: 'm', label: 'M' },
      { value: 'l', label: 'L' },
      { value: 'xl', label: 'XL' },
      { value: 'xxl', label: 'XXL' }
    ],
    condition: [
      { value: 'all', label: 'All Conditions' },
      { value: 'excellent', label: 'Excellent' },
      { value: 'very_good', label: 'Very Good' },
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' }
    ],
    price_range: [
      { value: 'all', label: 'All Prices' },
      { value: '0-500', label: '₹0 - ₹500' },
      { value: '500-1000', label: '₹500 - ₹1,000' },
      { value: '1000-2000', label: '₹1,000 - ₹2,000' },
      { value: '2000-3000', label: '₹2,000 - ₹3,000' }
    ],
    material: [
      { value: 'all', label: 'All Materials' },
      { value: 'cotton', label: '100% Cotton' },
      { value: 'polyester', label: 'Polyester' },
      { value: 'blend', label: 'Cotton Blend' },
      { value: 'wool', label: 'Wool' },
      { value: 'denim', label: 'Denim' },
      { value: 'silk', label: 'Silk' }
    ],
    era: [
      { value: 'all', label: 'All Eras' },
      { value: '1960s', label: '1960s' },
      { value: '1970s', label: '1970s' },
      { value: '1980s', label: '1980s' },
      { value: '1990s', label: '1990s' },
      { value: '2000s', label: '2000s' },
      { value: '2010s', label: '2010s' }
    ],
    color: [
      { value: 'all', label: 'All Colors' },
      { value: 'black', label: 'Black', hex: '#000000' },
      { value: 'white', label: 'White', hex: '#FFFFFF' },
      { value: 'gray', label: 'Gray', hex: '#808080' },
      { value: 'red', label: 'Red', hex: '#DC2626' },
      { value: 'blue', label: 'Blue', hex: '#2563EB' },
      { value: 'green', label: 'Green', hex: '#16A34A' },
      { value: 'yellow', label: 'Yellow', hex: '#EAB308' },
      { value: 'brown', label: 'Brown', hex: '#92400E' }
    ]
  };

  const getActiveFilterCount = () => {
    return Object.keys(state.filters).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 sticky top-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-vintage font-bold text-gray-900 mb-2 sm:mb-0">
          Filters
        </h3>
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-vintage-600 hover:text-vintage-700 font-semibold self-start sm:self-auto"
          >
            Clear All ({getActiveFilterCount()})
          </button>
        )}
      </div>

      {/* Search Query Display */}
      {state.searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-gray-50 rounded-lg"
        >
          <div className="text-sm text-gray-600">
            Searching for: <span className="font-semibold">"{state.searchQuery}"</span>
          </div>
        </motion.div>
      )}

      {/* Filter Sections */}
      <div className="space-y-4 md:space-y-6">
        {/* Category Filter */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 md:mb-3 text-sm md:text-base">Category</h4>
          <select
            value={state.filters.category || 'all'}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full input-field text-sm md:text-base py-2 md:py-3"
          >
            {filterOptions.category.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Size Filter */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 md:mb-3 text-sm md:text-base">Size</h4>
          <select
            value={state.filters.size || 'all'}
            onChange={(e) => handleFilterChange('size', e.target.value)}
            className="w-full input-field text-sm md:text-base py-2 md:py-3"
          >
            {filterOptions.size.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Filter */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 md:mb-3 text-sm md:text-base">Condition</h4>
          <select
            value={state.filters.condition || 'all'}
            onChange={(e) => handleFilterChange('condition', e.target.value)}
            className="w-full input-field text-sm md:text-base py-2 md:py-3"
          >
            {filterOptions.condition.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 md:mb-3 text-sm md:text-base">Price Range</h4>
          <select
            value={state.filters.price_range || 'all'}
            onChange={(e) => handleFilterChange('price_range', e.target.value)}
            className="w-full input-field text-sm md:text-base py-2 md:py-3"
          >
            {filterOptions.price_range.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Material Filter */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 md:mb-3 text-sm md:text-base">Material</h4>
          <select
            value={state.filters.material || 'all'}
            onChange={(e) => handleFilterChange('material', e.target.value)}
            className="w-full input-field text-sm md:text-base py-2 md:py-3"
          >
            {filterOptions.material.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Era/Decade Filter */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 md:mb-3 text-sm md:text-base">Era</h4>
          <select
            value={state.filters.era || 'all'}
            onChange={(e) => handleFilterChange('era', e.target.value)}
            className="w-full input-field text-sm md:text-base py-2 md:py-3"
          >
            {filterOptions.era.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Color Filter */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2 md:mb-3 text-sm md:text-base">Color</h4>
          <select
            value={state.filters.color || 'all'}
            onChange={(e) => handleFilterChange('color', e.target.value)}
            className="w-full input-field text-sm md:text-base py-2 md:py-3"
          >
            {filterOptions.color.map(option => (
              <option key={option.value} value={option.value}>
                {option.hex && option.value !== 'all' ? '● ' : ''}{option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Featured Only Checkbox */}
        <div className="pt-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={state.filters.is_featured || false}
              onChange={(e) => handleFilterChange('is_featured', e.target.checked ? true : '')}
              className="mr-3 text-vintage-600 w-4 h-4 md:w-5 md:h-5"
            />
            <span className="text-gray-700 text-sm md:text-base">Featured Products Only</span>
          </label>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border-t pt-4 mt-4 md:mt-6">
        <div className="text-xs md:text-sm text-gray-600 space-y-2">
          <div className="flex justify-between">
            <span>Total Products:</span>
            <span className="font-semibold">{state.totalProducts || 'Loading...'}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Filters:</span>
            <span className="font-semibold">{getActiveFilterCount()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
