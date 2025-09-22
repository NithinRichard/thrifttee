import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';

const ProductFilters = () => {
  const { state, actions } = useApp();

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...state.filters };

    if (value === '' || value === 'all') {
      delete newFilters[filterType];
    } else {
      newFilters[filterType] = value;
    }

    actions.setFilters(newFilters);
  };

  const clearAllFilters = () => {
    actions.setFilters({});
  };

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
      { value: 'XS', label: 'XS' },
      { value: 'S', label: 'S' },
      { value: 'M', label: 'M' },
      { value: 'L', label: 'L' },
      { value: 'XL', label: 'XL' },
      { value: 'XXL', label: 'XXL' }
    ],
    condition: [
      { value: 'all', label: 'All Conditions' },
      { value: 'new', label: 'New' },
      { value: 'excellent', label: 'Excellent' },
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' },
      { value: 'poor', label: 'Poor' }
    ],
    price_range: [
      { value: 'all', label: 'All Prices' },
      { value: '0-25', label: '$0 - $25' },
      { value: '25-50', label: '$25 - $50' },
      { value: '50-100', label: '$50 - $100' },
      { value: '100+', label: '$100+' }
    ]
  };

  const getActiveFilterCount = () => {
    return Object.keys(state.filters).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-vintage font-bold text-gray-900">
          Filters
        </h3>
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-vintage-600 hover:text-vintage-700 font-semibold"
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

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Category</h4>
        <select
          value={state.filters.category || 'all'}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="w-full input-field"
        >
          {filterOptions.category.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Size Filter */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Size</h4>
        <select
          value={state.filters.size || 'all'}
          onChange={(e) => handleFilterChange('size', e.target.value)}
          className="w-full input-field"
        >
          {filterOptions.size.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Condition Filter */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Condition</h4>
        <select
          value={state.filters.condition || 'all'}
          onChange={(e) => handleFilterChange('condition', e.target.value)}
          className="w-full input-field"
        >
          {filterOptions.condition.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Price Range</h4>
        <select
          value={state.filters.price_range || 'all'}
          onChange={(e) => handleFilterChange('price_range', e.target.value)}
          className="w-full input-field"
        >
          {filterOptions.price_range.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Featured Only Checkbox */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={state.filters.is_featured || false}
            onChange={(e) => handleFilterChange('is_featured', e.target.checked ? true : '')}
            className="mr-2 text-vintage-600"
          />
          <span className="text-gray-700">Featured Products Only</span>
        </label>
      </div>

      {/* Quick Stats */}
      <div className="border-t pt-4">
        <div className="text-sm text-gray-600 space-y-2">
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
