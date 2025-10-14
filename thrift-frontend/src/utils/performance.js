/**
 * Performance Monitoring Utilities
 */

// Web Vitals tracking
export const reportWebVitals = (metric) => {
  const { name, value, id } = metric;
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}:`, value);
  }
  
  // Send to analytics in production
  if (window.gtag && process.env.REACT_APP_GA_MEASUREMENT_ID) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_label: id,
      non_interaction: true,
    });
  }
};

// Performance observer for long tasks
export const observeLongTasks = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('[Performance] Long task detected:', entry.duration, 'ms');
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long task API not supported
    }
  }
};

// Measure component render time
export const measureRender = (componentName, callback) => {
  const start = performance.now();
  const result = callback();
  const duration = performance.now() - start;
  
  if (duration > 16) { // Longer than 1 frame (60fps)
    console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`);
  }
  
  return result;
};

// Resource timing
export const logResourceTiming = () => {
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource');
    const slowResources = resources.filter(r => r.duration > 1000);
    
    if (slowResources.length > 0) {
      console.warn('[Performance] Slow resources:', slowResources.map(r => ({
        name: r.name,
        duration: r.duration,
        size: r.transferSize
      })));
    }
  }
};

// Memory usage (Chrome only)
export const logMemoryUsage = () => {
  if (performance.memory) {
    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
    const usedMB = (usedJSHeapSize / 1048576).toFixed(2);
    const totalMB = (totalJSHeapSize / 1048576).toFixed(2);
    const limitMB = (jsHeapSizeLimit / 1048576).toFixed(2);
    
    console.log(`[Performance] Memory: ${usedMB}MB / ${totalMB}MB (limit: ${limitMB}MB)`);
    
    if (usedJSHeapSize / jsHeapSizeLimit > 0.9) {
      console.warn('[Performance] Memory usage is high!');
    }
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (process.env.NODE_ENV === 'development') {
    observeLongTasks();
    
    // Log resource timing after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        logResourceTiming();
        logMemoryUsage();
      }, 3000);
    });
    
    // Log memory usage periodically
    setInterval(logMemoryUsage, 30000);
  }
};
