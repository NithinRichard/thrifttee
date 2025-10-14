import { useState, useEffect } from 'react';

/**
 * Hook for optimizing image loading
 */
export const useImageOptimization = (src, options = {}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    width,
    height,
    quality = 80,
    format = 'auto'
  } = options;

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    // Build optimized URL
    let optimizedSrc = src;
    const params = new URLSearchParams();

    if (width) params.append('w', width);
    if (height) params.append('h', height);
    if (quality) params.append('q', quality);
    if (format !== 'auto') params.append('f', format);

    if (params.toString()) {
      optimizedSrc = `${src}${src.includes('?') ? '&' : '?'}${params.toString()}`;
    }

    // Preload image
    const img = new Image();
    img.src = optimizedSrc;

    img.onload = () => {
      setImageSrc(optimizedSrc);
      setIsLoading(false);
    };

    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
      setImageSrc(src); // Fallback to original
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, width, height, quality, format]);

  return { imageSrc, isLoading, error };
};

/**
 * Hook for lazy loading images
 */
export const useLazyImage = (ref, options = {}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0.01
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options.rootMargin, options.threshold]);

  return isVisible;
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (src, widths = [320, 640, 768, 1024, 1280, 1920]) => {
  if (!src || src.startsWith('data:')) return '';
  
  return widths
    .map(w => `${src}?w=${w} ${w}w`)
    .join(', ');
};

/**
 * Get optimal image size based on viewport
 */
export const getOptimalImageSize = () => {
  const width = window.innerWidth;
  
  if (width <= 640) return { width: 640, size: 'sm' };
  if (width <= 768) return { width: 768, size: 'md' };
  if (width <= 1024) return { width: 1024, size: 'lg' };
  if (width <= 1280) return { width: 1280, size: 'xl' };
  return { width: 1920, size: '2xl' };
};
