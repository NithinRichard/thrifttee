import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const supportOptions = [
    { icon: '❓', label: 'FAQ', link: '/faq' },
    { icon: '↩️', label: 'Returns', link: '/returns' },
    { icon: '📧', label: 'Email Us', link: 'mailto:support@thriftee.com' },
    { icon: '💬', label: 'WhatsApp', link: 'https://wa.me/919876543210' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-white rounded-lg shadow-xl p-4 w-64"
          >
            <h3 className="font-semibold text-gray-900 mb-3">How can we help?</h3>
            <div className="space-y-2">
              {supportOptions.map((option, index) => (
                option.link.startsWith('http') || option.link.startsWith('mailto') ? (
                  <a
                    key={index}
                    href={option.link}
                    target={option.link.startsWith('http') ? '_blank' : undefined}
                    rel={option.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-2xl mr-3">{option.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{option.label}</span>
                  </a>
                ) : (
                  <Link
                    key={index}
                    to={option.link}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-2xl mr-3">{option.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{option.label}</span>
                  </Link>
                )
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-vintage-600 hover:bg-vintage-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-110"
        aria-label="Support"
      >
        {isOpen ? (
          <span className="text-2xl">✕</span>
        ) : (
          <span className="text-2xl">💬</span>
        )}
      </button>
    </div>
  );
};

export default SupportWidget;
