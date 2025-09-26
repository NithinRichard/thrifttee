import React, { useState } from 'react';
import VintageReviews from './VintageReviews';
import VintageReviewForm from './VintageReviewForm';
import { useApp } from '../../contexts/AppContext';
import './VintageReviews.css';

const ProductReviews = ({ productId }) => {
  const { state } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const isLoggedIn = state.isAuthenticated;

  const handleReviewSubmitted = (newReview) => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1); // Force refresh of reviews
  };

  return (
    <div className="product-reviews-section">
      <div className="reviews-header">
        <h2>Customer Reviews</h2>
        {isLoggedIn && (
          <button
            className="write-review-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
        {!isLoggedIn && (
          <p className="login-prompt">
            <a href="/login">Sign in</a> to write a review
          </p>
        )}
      </div>

      {showForm && isLoggedIn && (
        <VintageReviewForm
          productId={productId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      <VintageReviews
        key={refreshKey}
        productId={productId}
      />
    </div>
  );
};

export default ProductReviews;