import React, { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';

const PersistentCart = () => {
  const { state, actions } = useApp();

  useEffect(() => {
    // Save user size preferences
    if (state.user && state.cart.length > 0) {
      const sizePreferences = state.cart
        .filter(item => item.size)
        .reduce((acc, item) => {
          acc[item.brand || 'default'] = item.size;
          return acc;
        }, {});
      
      localStorage.setItem('sizePreferences', JSON.stringify(sizePreferences));
    }
  }, [state.cart, state.user]);

  useEffect(() => {
    // Restore size preferences on login
    if (state.user) {
      const savedPreferences = localStorage.getItem('sizePreferences');
      if (savedPreferences) {
        // Size preferences are now available for checkout process
        window.userSizePreferences = JSON.parse(savedPreferences);
      }
    }
  }, [state.user]);

  return null; // This is a utility component with no UI
};

export default PersistentCart;