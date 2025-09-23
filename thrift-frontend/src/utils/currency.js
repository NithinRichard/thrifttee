export const formatINR = (value) => {
  const number = typeof value === 'number' ? value : parseFloat(value || 0);
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(number);
  } catch (_) {
    return `₹${number.toFixed(2)}`;
  }
};


