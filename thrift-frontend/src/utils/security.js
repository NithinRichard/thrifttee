/**
 * Security utilities for payment processing and data protection
 * Ensures PCI DSS compliance and secure data handling
 */

/**
 * Checks if the current connection is secure (HTTPS)
 * @returns {boolean} True if running on HTTPS or in development
 */
export const isSecureConnection = () => {
  if (process.env.NODE_ENV === 'development') {
    return true; // Allow HTTP in development
  }
  return window.location.protocol === 'https:';
};

/**
 * Validates if payment processing should be allowed
 * @returns {boolean} True if payment processing is safe
 */
export const canProcessPayment = () => {
  return isSecureConnection();
};

/**
 * Gets security status information
 * @returns {object} Security status object
 */
export const getSecurityStatus = () => {
  const isHttps = isSecureConnection();
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    isSecure: isHttps,
    isProduction,
    canCollectPayment: isProduction ? isHttps : true,
    warnings: [
      !isHttps && isProduction ? 'HTTPS required for payment processing' : null,
      'Payment processor not integrated - demo mode only'
    ].filter(Boolean)
  };
};

/**
 * Sanitizes sensitive data from objects (for logging)
 * @param {object} data - Object containing sensitive information
 * @returns {object} Sanitized object safe for logging
 */
export const sanitizeForLogging = (data) => {
  if (!data || typeof data !== 'object') return data;

  const sensitiveFields = ['cardNumber', 'cvc', 'password', 'token', 'secret'];
  const sanitized = { ...data };

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
};

/**
 * Validates payment form data structure
 * @param {object} paymentData - Payment data to validate
 * @returns {object} Validation result
 */
export const validatePaymentData = (paymentData) => {
  const errors = [];

  if (!paymentData) {
    errors.push('Payment data is required');
    return { isValid: false, errors };
  }

  // Check for raw card data (should be tokenized)
  if (paymentData.cardNumber && paymentData.cardNumber.replace(/\s/g, '').length > 4) {
    errors.push('Raw card numbers should not be stored');
  }

  if (paymentData.cvc) {
    errors.push('CVC should not be stored in plain text');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
