import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Cleanup timeouts on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      setToasts(prev => {
        prev.forEach(toast => {
          if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
          }
        });
        return [];
      });
    };
  }, []);

  const addToast = useCallback((message, type = TOAST_TYPES.INFO, duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast = { id, message, type, duration };

    setToasts(prev => [...prev, toast]);

    // Auto remove toast after duration
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, duration);

      // Store timeout ID for potential cleanup
      setToasts(prev => prev.map(t => t.id === id ? { ...t, timeoutId } : t));
    }

    return id;
  }, []);

  const removeToastByUser = useCallback((id) => {
    // Clean up timeout if it exists to prevent memory leaks
    setToasts(prev => {
      const toastToRemove = prev.find(t => t.id === id);
      if (toastToRemove?.timeoutId) {
        clearTimeout(toastToRemove.timeoutId);
      }
      return prev.filter(toast => toast.id !== id);
    });
  }, []);

  const removeToast = useCallback((id) => {
    // This is called by timeout, so we don't need to clear timeout here
    // as it's already firing
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    return addToast(message, TOAST_TYPES.SUCCESS, duration);
  }, [addToast]);

  const showError = useCallback((message, duration) => {
    return addToast(message, TOAST_TYPES.ERROR, duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration) => {
    return addToast(message, TOAST_TYPES.WARNING, duration);
  }, [addToast]);

  const showInfo = useCallback((message, duration) => {
    return addToast(message, TOAST_TYPES.INFO, duration);
  }, [addToast]);

  const value = {
    addToast,
    removeToast,
    removeToastByUser,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToastByUser={removeToastByUser} />
    </ToastContext.Provider>
  );
};

// Toast container component
const ToastContainer = ({ toasts, removeToastByUser }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToastByUser(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Individual toast component
const Toast = ({ toast, onClose }) => {
  const getToastStyles = () => {
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return 'bg-green-500 border-green-600 text-white';
      case TOAST_TYPES.ERROR:
        return 'bg-red-500 border-red-600 text-white';
      case TOAST_TYPES.WARNING:
        return 'bg-yellow-500 border-yellow-600 text-white';
      case TOAST_TYPES.INFO:
      default:
        return 'bg-blue-500 border-blue-600 text-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className={`
        max-w-sm w-full p-4 rounded-lg border-l-4 shadow-lg
        ${getToastStyles()}
      `}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-3 text-white hover:text-gray-200 focus:outline-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
