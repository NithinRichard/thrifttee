import { useEffect } from 'react';

export const useRecentlyViewed = (product) => {
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

    const existing = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = existing.filter(item => item.id !== product.id);
    const updated = [recentItem, ...filtered].slice(0, 10);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  }, [product]);
};