import React from 'react';
import './VintageReservation.css';

const VintageReservationWarning = ({ productName, expiresAt }) => {
  return (
    <div className="vintage-hold-overlay">
      <div className="hold-tag">
        <div className="tag-string"></div>
        <div className="tag-content">
          <h3 className="typewriter-text">CURRENTLY ON HOLD</h3>
          <p className="hold-details">This item is being considered by another customer</p>
          {expiresAt && (
            <p className="hold-expires">Available again soon</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VintageReservationWarning;