export const initGA = (measurementId) => {
  if (typeof window !== 'undefined' && !window.gtag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
  }
};

export const trackPageView = (path) => {
  if (window.gtag) {
    window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
      page_path: path,
    });
  }
};

export const trackEvent = (category, action, label, value) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackProductView = (product) => {
  if (window.gtag) {
    window.gtag('event', 'view_item', {
      items: [{
        id: product.id,
        name: product.title,
        brand: product.brand?.name || product.brand,
        category: product.category?.name || product.category,
        price: product.price,
      }],
    });
  }
};

export const trackAddToCart = (product, quantity = 1) => {
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      items: [{
        id: product.id,
        name: product.title,
        brand: product.brand?.name || product.brand,
        category: product.category?.name || product.category,
        price: product.price,
        quantity: quantity,
      }],
    });
  }
};

export const trackCheckout = (items, value) => {
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      items: items,
      value: value,
    });
  }
};

export const trackPurchase = (transactionId, items, value) => {
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      items: items,
    });
  }
};

export const trackSearch = (searchTerm) => {
  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
    });
  }
};
