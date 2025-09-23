/**
 * Validates and normalizes quantity values
 * @param {number} quantity - The quantity to validate
 * @param {number} defaultValue - Default value if quantity is invalid (default: 1)
 * @returns {number} - Validated and normalized quantity
 */
export const validateQuantity = (quantity, defaultValue = 1) => {
  const validQuantity = typeof quantity === 'number' && !isNaN(quantity) && quantity > 0
    ? Math.floor(quantity) // Ensure it's an integer
    : defaultValue;

  return validQuantity;
};

/**
 * Validates positive number values
 * @param {number} value - The value to validate
 * @param {number} defaultValue - Default value if invalid (default: 0)
 * @returns {number} - Validated number
 */
export const validatePositiveNumber = (value, defaultValue = 0) => {
  const validNumber = typeof value === 'number' && !isNaN(value) && value > 0
    ? value
    : defaultValue;

  return validNumber;
};
