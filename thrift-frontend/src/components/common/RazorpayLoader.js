import { useEffect } from 'react';

const RazorpayLoader = () => {
  useEffect(() => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      return;
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    // Add script to head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default RazorpayLoader;
