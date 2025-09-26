import React, { useState } from 'react';
import './VintageReviews.css';

const VintageReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating || !title.trim() || !comment.trim()) {
      setError('Please fill in all fields and select a rating');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/v1/products/products/${productId}/reviews/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          rating,
          title: title.trim(),
          comment: comment.trim()
        })
      });

      if (response.ok) {
        const newReview = await response.json();
        setRating(0);
        setTitle('');
        setComment('');
        if (onReviewSubmitted) {
          onReviewSubmitted(newReview);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit review');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarInput = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`vintage-star-input ${i <= rating ? 'selected' : ''}`}
          onClick={() => handleStarClick(i)}
          disabled={submitting}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="vintage-review-form-container">
      <div className="form-header">
        <h3>Share Your Experience</h3>
        <p>Help fellow vintage enthusiasts with your honest feedback</p>
      </div>

      <form onSubmit={handleSubmit} className="vintage-review-form">
        {/* Rating Input */}
        <div className="form-group">
          <label className="form-label">Your Rating</label>
          <div className="star-rating-input">
            {renderStarInput()}
            <span className="rating-text">
              {rating === 0 && 'Select a rating'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          </div>
        </div>

        {/* Title Input */}
        <div className="form-group">
          <label className="form-label">Review Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience..."
            className="vintage-input"
            maxLength="200"
            disabled={submitting}
          />
          <div className="char-count">{title.length}/200</div>
        </div>

        {/* Comment Input */}
        <div className="form-group">
          <label className="form-label">Your Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details about the quality, fit, condition, and your overall experience..."
            className="vintage-textarea"
            rows="6"
            disabled={submitting}
          />
          <div className="textarea-lines"></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="vintage-submit-btn"
          disabled={submitting || !rating || !title.trim() || !comment.trim()}
        >
          <div className="stamp-border">
            <div className="stamp-content">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </div>
          </div>
        </button>
      </form>
    </div>
  );
};

export default VintageReviewForm;