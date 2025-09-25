/**
 * Date and time formatting utilities
 */

/**
 * Check if a date is valid
 * @param {Date} date - Date object to validate
 * @returns {boolean} - True if date is valid
 */
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Parse and validate a timestamp string
 * @param {string} timestamp - ISO timestamp string
 * @returns {Date|null} - Valid Date object or null if invalid
 */
export const parseTimestamp = (timestamp) => {
  if (!timestamp) return null;

  const date = new Date(timestamp);
  return isValidDate(date) ? date : null;
};

/**
 * Format order timestamp in a user-friendly way
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} - Formatted timestamp string
 */
export const formatOrderTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown';

  const date = parseTimestamp(timestamp);
  if (!date) return 'Invalid date';

  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  // If order was placed today, show time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const orderDate = new Date(timestamp);
  orderDate.setHours(0, 0, 0, 0);

  if (orderDate.getTime() === today.getTime()) {
    return `Today at ${date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })}`;
  }

  // If order was placed yesterday
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (orderDate.getTime() === yesterday.getTime()) {
    return `Yesterday at ${date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })}`;
  }

  // If order was placed within the last week
  if (diffInHours < 24 * 7) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${days[date.getDay()]} at ${date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })}`;
  }

  // For older orders, show full date and time
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago", "in 2 hours")
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Unknown';

  const date = parseTimestamp(timestamp);
  if (!date) return 'Invalid date';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  // Handle future dates
  if (diffInSeconds < 0) {
    const futureSeconds = Math.abs(diffInSeconds);

    if (futureSeconds < 60) {
      return 'In a moment';
    }

    const futureMinutes = Math.floor(futureSeconds / 60);
    if (futureMinutes < 60) {
      return `In ${futureMinutes} minute${futureMinutes > 1 ? 's' : ''}`;
    }

    const futureHours = Math.floor(futureMinutes / 60);
    if (futureHours < 24) {
      return `In ${futureHours} hour${futureHours > 1 ? 's' : ''}`;
    }

    const futureDays = Math.floor(futureHours / 24);
    if (futureDays < 7) {
      return `In ${futureDays} day${futureDays > 1 ? 's' : ''}`;
    }

    return 'In the future';
  }

  // Handle past dates
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

/**
 * Format date for display
 * @param {string} timestamp - ISO timestamp string
 * @param {object} options - Date formatting options
 * @returns {string} - Formatted date string
 */
export const formatDate = (timestamp, options = {}) => {
  if (!timestamp) return 'Unknown';

  const date = parseTimestamp(timestamp);
  if (!date) return 'Invalid date';

  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };

  return date.toLocaleDateString('en-IN', defaultOptions);
};

/**
 * Format time for display
 * @param {string} timestamp - ISO timestamp string
 * @param {object} options - Time formatting options
 * @returns {string} - Formatted time string
 */
export const formatTime = (timestamp, options = {}) => {
  if (!timestamp) return 'Unknown';

  const date = parseTimestamp(timestamp);
  if (!date) return 'Invalid date';

  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options
  };

  return date.toLocaleTimeString('en-IN', defaultOptions);
};
