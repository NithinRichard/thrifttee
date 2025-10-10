import { useEffect } from 'react';

export const useRecentlyViewed = (product, userId = null) => {
  useEffect(() => {
    if (!product) return;

    const recentItem = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      image: product.primary_image,
      brand: product.brand,
      timestamp: Date.now()
    };

    // Use user-specific key if user is logged in, otherwise use generic key for guests
    const storageKey = userId ? `recentlyViewed_${userId}` : 'recentlyViewed_guest';
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const filtered = existing.filter(item => item.id !== product.id);
    const updated = [recentItem, ...filtered].slice(0, 10);

    localStorage.setItem(storageKey, JSON.stringify(updated));
  }, [product, userId]);
};

// Helper function to get recently viewed items for a specific user
export const getRecentlyViewed = (userId = null) => {
  const storageKey = userId ? `recentlyViewed_${userId}` : 'recentlyViewed_guest';
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
};

// Helper function to clear recently viewed items for a specific user
export const clearRecentlyViewed = (userId = null) => {
  const storageKey = userId ? `recentlyViewed_${userId}` : 'recentlyViewed_guest';
  localStorage.removeItem(storageKey);
};

// Helper function to clear all recently viewed items (for all users)
export const clearAllRecentlyViewed = () => {
  const keys = Object.keys(localStorage).filter(key => key.startsWith('recentlyViewed_') || key === 'recentlyViewed_guest');
  keys.forEach(key => localStorage.removeItem(key));
};