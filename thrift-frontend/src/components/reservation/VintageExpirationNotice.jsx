import React from 'react';
import './VintageReservation.css';

const VintageExpirationNotice = ({ productName, onClose }) => {
  return (
    <div className="vintage-receipt-overlay">
      <div className="return-receipt">
        <div className="receipt-header">
          <div className="perforated-edge"></div>
          <h3 className="dot-matrix-text">RESERVATION EXPIRED</h3>
        </div>
        <div className="receipt-body">
          <p className="receipt-line">Item: {productName}</p>
          <p className="receipt-line">Status: RETURNED TO FLOOR</p>
          <p className="receipt-line">Time: {new Date().toLocaleTimeString()}</p>
          <div className="receipt-divider">- - - - - - - - - - - - - - -</div>
          <p className="receipt-footer">Thank you for browsing</p>
        </div>
        <button className="receipt-close" onClick={onClose}>
          <span className="dot-matrix-text">ACKNOWLEDGE</span>
        </button>
      </div>
    </div>
  );
};

export default VintageExpirationNotice;