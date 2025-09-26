import React, { useState, useEffect } from 'react';
import './VintageReviews.css';

const VintageReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/products/products/${productId}/reviews/?sort=${sortBy}`);
      const data = await response.json();
      setReviews(data.reviews);
      setAverageRating(data.average_rating);
      setTotalReviews(data.total_reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, isAverage = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`vintage-star ${i <= rating ? 'filled' : 'empty'} ${isAverage ? 'average' : ''}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const formatDaysAgo = (days) => {
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="vintage-reviews-loading">
        <div className="vintage-spinner"></div>
        <p>Loading customer feedback...</p>
      </div>
    );
  }

  return (
    <div className="vintage-reviews-container">
      {/* Average Rating Display */}
      <div className="vintage-rating-summary">
        <div className="rating-display">
          <div className="average-stars">
            {renderStars(Math.round(averageRating), true)}
          </div>
          <div className="rating-number">{averageRating.toFixed(1)}</div>
        </div>
        <div className="review-count">
          Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </div>
      </div>

      {/* Review Sorting */}
      <div className="vintage-sort-tags">
        <span className="sort-label">Sort by:</span>
        {[
          { value: 'newest', label: 'Newest' },
          { value: 'oldest', label: 'Oldest' },
          { value: 'rating_high', label: 'Highest Rated' },
          { value: 'rating_low', label: 'Lowest Rated' }
        ].map(option => (
          <button
            key={option.value}
            className={`vintage-tag ${sortBy === option.value ? 'active' : ''}`}
            onClick={() => setSortBy(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="vintage-reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <div className="empty-notebook">
              <p>No customer feedback yet.</p>
              <p>Be the first to share your experience!</p>
            </div>
          </div>
        ) : (
          reviews.map((review, index) => (
            <div key={review.id} className="vintage-review-card" style={{ '--card-rotation': `${(index % 3 - 1) * 0.5}deg` }}>
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-initials">{review.reviewer_initials}</div>
                  <div className="review-meta">
                    <div className="review-stars">
                      {renderStars(review.rating)}
                    </div>
                    <div className="review-date">{formatDaysAgo(review.days_since_review)}</div>
                  </div>
                </div>
                {review.is_verified_purchase && (
                  <div className="verified-badge">
                    <div className="wax-seal">
                      <span className="seal-text">VERIFIED</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="review-content">
                <h4 className="review-title">{review.title}</h4>
                <p className="review-comment">{review.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VintageReviews;