
import React from 'react';
import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/currency';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex items-center border-b border-gray-200 pb-6">
      <div className="w-24 h-24 mr-6">
        <img
          src={item.image || 'https://via.placeholder.com/150'}
          alt={item.title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex-grow">
        <Link
          to={`/products/${item.slug}`}
          className="text-lg font-bold text-gray-800 hover:text-vintage-600"
        >
          {item.title}
        </Link>
        <div className="text-gray-600">{formatINR(item.price)}</div>
        <div className="text-sm text-gray-500">
          Size: {item.size || 'N/A'} | Condition: {item.condition || 'N/A'}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            -
          </button>
          <span className="px-4 py-1 text-gray-800">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
          >
            +
          </button>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
