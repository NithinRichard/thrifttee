import { useState, useEffect } from 'react';

export const useABTest = (testName, variants = ['A', 'B']) => {
  const [variant, setVariant] = useState('A');

  useEffect(() => {
    const storageKey = `ab_test_${testName}`;
    let userVariant = localStorage.getItem(storageKey);
    
    if (!userVariant) {
      // Assign random variant for new users
      userVariant = variants[Math.floor(Math.random() * variants.length)];
      localStorage.setItem(storageKey, userVariant);
      
      // Track assignment
      if (window.gtag) {
        window.gtag('event', 'ab_test_assignment', {
          test_name: testName,
          variant: userVariant
        });
      }
    }
    
    setVariant(userVariant);
  }, [testName, variants]);

  const trackEvent = (eventName, eventData = {}) => {
    if (window.gtag) {
      window.gtag('event', eventName, {
        test_name: testName,
        variant,
        ...eventData
      });
    }
  };

  return { variant, trackEvent };
};