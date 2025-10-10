import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumbs = ({ items }) => (
  <nav className="flex items-center text-sm text-gray-600 mb-4 overflow-x-auto">
    <Link to="/" className="hover:text-vintage-600 whitespace-nowrap">Home</Link>
    {items.map((item, i) => (
      <React.Fragment key={i}>
        <span className="mx-2">/</span>
        {item.link ? (
          <Link to={item.link} className="hover:text-vintage-600 whitespace-nowrap">{item.label}</Link>
        ) : (
          <span className="text-gray-900 font-medium whitespace-nowrap">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

export default Breadcrumbs;
