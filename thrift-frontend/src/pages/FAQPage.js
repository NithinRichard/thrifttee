import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Orders & Shipping',
      questions: [
        {
          q: 'How long does shipping take?',
          a: 'Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available at checkout.'
        },
        {
          q: 'Do you ship internationally?',
          a: 'Currently, we only ship within India. International shipping coming soon!'
        },
        {
          q: 'How can I track my order?',
          a: 'You\'ll receive a tracking link via email once your order ships. You can also check order status in your profile.'
        },
        {
          q: 'What if my item is damaged during shipping?',
          a: 'Contact us within 48 hours of delivery with photos. We\'ll arrange a replacement or full refund.'
        }
      ]
    },
    {
      category: 'Returns & Exchanges',
      questions: [
        {
          q: 'What is your return policy?',
          a: '7-day returns for unworn items with tags attached. Item must be in original condition.'
        },
        {
          q: 'How do I initiate a return?',
          a: 'Go to your profile, find the order, and click "Request Return". We\'ll email you a return label.'
        },
        {
          q: 'Can I exchange for a different size?',
          a: 'Yes! Select "Exchange" when initiating your return. Subject to availability.'
        },
        {
          q: 'When will I receive my refund?',
          a: 'Refunds are processed within 5-7 business days after we receive your return.'
        }
      ]
    },
    {
      category: 'Sizing & Fit',
      questions: [
        {
          q: 'How do vintage sizes compare to modern sizes?',
          a: 'Vintage sizes often run smaller. Check our size guide on each product page for measurements and modern size equivalents.'
        },
        {
          q: 'What measurements should I take?',
          a: 'Measure chest (pit-to-pit), length (shoulder to hem), and shoulder width. Compare with our product measurements.'
        },
        {
          q: 'What if the item doesn\'t fit?',
          a: 'We offer free exchanges within 7 days. See our return policy for details.'
        }
      ]
    },
    {
      category: 'Product Condition',
      questions: [
        {
          q: 'What does "Excellent" condition mean?',
          a: 'Excellent items show minimal to no wear, no visible flaws, and look nearly new.'
        },
        {
          q: 'Are flaws disclosed?',
          a: 'Yes! All flaws are documented in photos and condition notes. Check the detailed condition report on each product.'
        },
        {
          q: 'Can I see more photos of an item?',
          a: 'Contact us for additional photos of any item. We\'re happy to provide more angles or close-ups.'
        }
      ]
    },
    {
      category: 'Payment & Security',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets via Razorpay.'
        },
        {
          q: 'Is my payment information secure?',
          a: 'Yes! All payments are processed through Razorpay with bank-level encryption. We never store your card details.'
        },
        {
          q: 'Do you offer Cash on Delivery?',
          a: 'COD is available for orders under ₹5,000 in select locations.'
        }
      ]
    },
    {
      category: 'Account & Wishlist',
      questions: [
        {
          q: 'Do I need an account to shop?',
          a: 'No! Guest checkout is available. However, an account lets you track orders, save favorites, and checkout faster.'
        },
        {
          q: 'How do I save items for later?',
          a: 'Click the heart icon on any product to add it to your wishlist. Login required.'
        },
        {
          q: 'Can I get notified when items are restocked?',
          a: 'Since our items are unique vintage pieces, restocking isn\'t available. But you can save searches to get alerts for similar items!'
        }
      ]
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-vintage font-bold text-gray-900 mb-4 text-center">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Find answers to common questions about shopping vintage at Thriftee
          </p>

          {/* Quick Contact */}
          <div className="bg-vintage-50 border border-vintage-200 rounded-lg p-6 mb-12 max-w-3xl mx-auto">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Still have questions?</h3>
              <p className="text-gray-600 mb-4">Our team is here to help!</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/contact" className="btn-primary">
                  Contact Support
                </Link>
                <a href="mailto:support@thriftee.com" className="btn-secondary">
                  Email Us
                </a>
              </div>
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="max-w-4xl mx-auto space-y-8">
            {faqs.map((category, catIndex) => (
              <motion.div
                key={catIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: catIndex * 0.1 }}
              >
                <h2 className="text-2xl font-vintage font-bold text-gray-900 mb-4">
                  {category.category}
                </h2>
                <div className="space-y-3">
                  {category.questions.map((faq, qIndex) => {
                    const globalIndex = `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === globalIndex;
                    
                    return (
                      <div
                        key={qIndex}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(globalIndex)}
                          className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-900 pr-4">
                            {faq.q}
                          </span>
                          <span className="text-vintage-600 text-xl flex-shrink-0">
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-6 pb-4"
                          >
                            <p className="text-gray-600 leading-relaxed">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Resources */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-vintage font-bold text-gray-900 mb-6 text-center">
              Helpful Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/size-guide" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="text-4xl mb-3">📏</div>
                <h3 className="font-semibold text-gray-900 mb-2">Size Guide</h3>
                <p className="text-sm text-gray-600">Learn how to measure and find your perfect fit</p>
              </Link>
              <Link to="/care-guide" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="text-4xl mb-3">🧺</div>
                <h3 className="font-semibold text-gray-900 mb-2">Care Guide</h3>
                <p className="text-sm text-gray-600">Tips for caring for vintage clothing</p>
              </Link>
              <Link to="/about" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="text-4xl mb-3">ℹ️</div>
                <h3 className="font-semibold text-gray-900 mb-2">About Us</h3>
                <p className="text-sm text-gray-600">Learn more about Thriftee's mission</p>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQPage;
