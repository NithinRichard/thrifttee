/**
 * Rupay Payment Integration
 * Handles Rupay card payments for Indian market
 * Integrates with NPCI's Rupay payment gateway
 */

const RUPAY_CONFIG = {
  // Rupay gateway endpoints (fixed URLs)
  TEST_GATEWAY: 'https://test-rupay.gateway.com',
  PROD_GATEWAY: 'https://api.rupay.npci.org.in',

  // Supported Rupay card types
  CARD_TYPES: {
    DEBIT: 'debit',
    CREDIT: 'credit',
    PREPAID: 'prepaid'
  },

  // Rupay BIN ranges (first 6 digits)
  BIN_RANGES: [
    '508500', '508501', '508502', '508503', '508504', '508505', '508506', '508507', '508508', '508509',
    '606000', '606001', '606002', '606003', '606004', '606005', '606006', '606007', '606008', '606009',
    '607000', '607001', '607002', '607003', '607004', '607005', '607006', '607007', '607008', '607009',
    '608000', '608001', '608002', '608003', '608004', '608005', '608006', '608007', '608008', '608009'
  ],

  // Test card numbers for development (when not in production)
  TEST_CARDS: {
    '5085000000000001': 'Valid Rupay Debit Card',
    '6060000000000002': 'Valid Rupay Credit Card',
    '6070000000000003': 'Valid Rupay Prepaid Card',
    '6080000000000004': 'Valid Rupay Premium Card'
  }
};

/**
 * Detects if card number is Rupay (including test cards in development)
 * @param {string} cardNumber - Card number to check
 * @param {boolean} allowTestCards - Whether to allow test cards
 * @returns {boolean} True if Rupay card
 */
export const isRupayCard = (cardNumber, allowTestCards = true) => {
  if (!cardNumber || typeof cardNumber !== 'string') return false;

  const cleanNumber = cardNumber.replace(/\s+/g, '');
  if (cleanNumber.length < 6) return false;

  const bin = cleanNumber.substring(0, 6);

  // Check if it's a valid Rupay BIN
  if (RUPAY_CONFIG.BIN_RANGES.includes(bin)) {
    return true;
  }

  // Check if it's a test card (only in development)
  if (allowTestCards && process.env.NODE_ENV !== 'production') {
    return RUPAY_CONFIG.TEST_CARDS.hasOwnProperty(cleanNumber);
  }

  return false;
};

/**
 * Gets available test card numbers for development
 * @returns {object} Test card numbers and descriptions
 */
export const getTestCardNumbers = () => {
  if (process.env.NODE_ENV === 'production') {
    return {};
  }
  return RUPAY_CONFIG.TEST_CARDS;
};

/**
 * Validates Rupay card number using Luhn algorithm (including test cards in development)
 * @param {string} cardNumber - Card number to validate
 * @param {boolean} allowTestCards - Whether to allow test cards
 * @returns {boolean} True if valid Rupay card
 */
export const validateRupayCard = (cardNumber, allowTestCards = true) => {
  if (!isRupayCard(cardNumber, allowTestCards)) return false;

  // For test cards in development, skip Luhn validation
  if (allowTestCards && process.env.NODE_ENV !== 'production') {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    if (RUPAY_CONFIG.TEST_CARDS.hasOwnProperty(cleanNumber)) {
      return true;
    }
  }

  // Luhn algorithm validation for real cards
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Formats Rupay card number with spaces
 * @param {string} value - Card number value
 * @returns {string} Formatted card number
 */
export const formatRupayCardNumber = (value) => {
  if (!value) return value;

  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(' ');
  } else {
    return v;
  }
};

/**
 * Validates Rupay card expiry date
 * @param {string} expiry - Expiry date in MM/YY format
 * @returns {boolean} True if valid expiry
 */
export const validateRupayExpiry = (expiry) => {
  if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) return false;

  const [month, year] = expiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  const expMonth = parseInt(month, 10);
  const expYear = parseInt(year, 10);

  if (expMonth < 1 || expMonth > 12) return false;

  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return false;
  }

  return true;
};

/**
 * Validates Rupay CVV
 * @param {string} cvv - CVV code
 * @returns {boolean} True if valid CVV
 */
export const validateRupayCVV = (cvv) => {
  if (!cvv || !/^\d{3}$/.test(cvv)) return false;
  return true;
};

/**
 * Rupay Payment Processor Class
 */
export class RupayPaymentProcessor {
  constructor(config = {}) {
    this.environment = config.environment || 'test';
    this.gatewayUrl = this.environment === 'production'
      ? RUPAY_CONFIG.PROD_GATEWAY
      : RUPAY_CONFIG.TEST_GATEWAY;

    this.merchantId = config.merchantId;
    this.terminalId = config.terminalId;
  }

  /**
   * Initializes Rupay payment session
   * @param {object} paymentData - Payment information
   * @returns {Promise<string>} Payment session token
   */
  async initializePayment(paymentData) {
    const sessionData = {
      merchantId: this.merchantId,
      terminalId: this.terminalId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'INR',
      orderId: paymentData.orderId,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(`${this.gatewayUrl}/payment/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.merchantId
        },
        body: JSON.stringify(sessionData)
      });

      if (!response.ok) {
        throw new Error(`Payment initialization failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.sessionToken;
    } catch (error) {
      console.error('Rupay payment initialization error:', error);

      // For development/demo purposes, return mock session token
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 Development mode: Using mock session token');
        return `mock_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      throw new Error('Failed to initialize Rupay payment session');
    }
  }

  /**
   * Processes Rupay payment
   * @param {object} paymentDetails - Payment details
   * @returns {Promise<object>} Payment result
   */
  async processPayment(paymentDetails) {
    const paymentPayload = {
      sessionToken: paymentDetails.sessionToken,
      cardNumber: paymentDetails.cardNumber.replace(/\s/g, ''),
      expiryDate: paymentDetails.expiryDate.replace(/\//g, ''),
      cvv: paymentDetails.cvv,
      cardholderName: paymentDetails.cardholderName,
      amount: paymentDetails.amount,
      currency: 'INR'
    };

    try {
      const response = await fetch(`${this.gatewayUrl}/payment/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': paymentDetails.sessionToken
        },
        body: JSON.stringify(paymentPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Payment processing failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        transactionId: result.transactionId,
        authCode: result.authCode,
        status: result.status
      };
    } catch (error) {
      console.error('Rupay payment processing error:', error);

      // For development/demo purposes, return mock successful payment
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 Development mode: Simulating successful payment');
        return {
          success: true,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          authCode: `AUTH_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          status: 'success'
        };
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validates Rupay payment configuration
   * @returns {boolean} True if configuration is valid
   */
  validateConfig() {
    return !!(this.merchantId && this.terminalId && this.gatewayUrl);
  }
}

/**
 * Creates Rupay payment form data
 * @param {object} formData - Form data from checkout
 * @param {object} cartData - Cart information
 * @returns {object} Rupay payment data
 */
export const createRupayPaymentData = (formData, cartData) => {
  return {
    cardNumber: formData.cardNumber,
    expiryDate: formData.expiryDate,
    cvv: formData.cvv,
    cardholderName: formData.fullName,
    amount: cartData.total,
    currency: 'INR',
    orderId: `ORDER_${Date.now()}`,
    customerEmail: formData.email,
    billingAddress: {
      street: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      country: 'India'
    }
  };
};

export default {
  isRupayCard,
  validateRupayCard,
  formatRupayCardNumber,
  validateRupayExpiry,
  validateRupayCVV,
  RupayPaymentProcessor,
  createRupayPaymentData,
  RUPAY_CONFIG
};
