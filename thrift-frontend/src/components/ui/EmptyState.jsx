import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon, title, message, ctaText, ctaLink }) => (
  <div className="text-center py-16 px-4">
    <div className="text-6xl mb-4">{icon}</div>
    <h2 className="text-2xl font-bold mb-2 text-gray-900">{title}</h2>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
    <Link 
      to={ctaLink} 
      className="inline-block bg-vintage-600 hover:bg-vintage-700 text-white px-6 py-3 rounded-lg font-semibold transition"
    >
      {ctaText}
    </Link>
  </div>
);

export default EmptyState;
