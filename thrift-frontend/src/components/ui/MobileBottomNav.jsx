import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

const MobileBottomNav = () => {
  const { state } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-40 safe-area-bottom">
      <div className="grid grid-cols-4 gap-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 ${isActive ? 'text-vintage-600' : 'text-gray-600'}`
          }
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-1">Home</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 ${isActive ? 'text-vintage-600' : 'text-gray-600'}`
          }
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-xs mt-1">Shop</span>
        </NavLink>

        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 relative ${isActive ? 'text-vintage-600' : 'text-gray-600'}`
          }
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-xs mt-1">Wishlist</span>
        </NavLink>

        <NavLink
          to={state.isAuthenticated ? '/profile' : '/login'}
          className={({ isActive }) =>
            `flex flex-col items-center py-2 ${isActive ? 'text-vintage-600' : 'text-gray-600'}`
          }
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs mt-1">Account</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
