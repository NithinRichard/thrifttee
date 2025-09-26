import React, { useState, useEffect } from 'react';
import './VintageReservation.css';

const VintageCountdownTimer = ({ timeRemaining, onExpire, onExtend, canExtend }) => {
  const [seconds, setSeconds] = useState(timeRemaining);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    setSeconds(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => {
        const newSeconds = prev - 1;
        setIsWarning(newSeconds <= 60);
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onExpire]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className="vintage-timer-container">
      <div className={`vintage-pocket-watch ${isWarning ? 'warning' : ''}`}>
        <div className="watch-face">
          <div className="roman-numerals">
            <span className="numeral twelve">XII</span>
            <span className="numeral three">III</span>
            <span className="numeral six">VI</span>
            <span className="numeral nine">IX</span>
          </div>
          <div className="watch-hands">
            <div 
              className="minute-hand" 
              style={{ transform: `rotate(${(minutes * 6) - 90}deg)` }}
            />
            <div 
              className="second-hand" 
              style={{ transform: `rotate(${(remainingSeconds * 6) - 90}deg)` }}
            />
          </div>
          <div className="center-dot" />
        </div>
        <div className="digital-display">
          {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
        </div>
      </div>
      
      {isWarning && (
        <div className="final-call-stamp">
          <span>FINAL CALL</span>
        </div>
      )}
      
      {canExtend && (
        <button className="extend-request-slip" onClick={onExtend}>
          <span className="handwritten">Request More Time?</span>
        </button>
      )}
    </div>
  );
};

export default VintageCountdownTimer;