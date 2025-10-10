import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import RazorpayLoader from './components/common/RazorpayLoader';
import RecentlyViewed from './components/ui/RecentlyViewed';
import PersistentCart from './components/ui/PersistentCart';
import IndustrialNostalgiaCartDrawer from './components/cart/IndustrialNostalgiaCartDrawer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutPageOptimized from './pages/CheckoutPageOptimized';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import FAQPage from './pages/FAQPage';
import ReturnRequestPage from './pages/ReturnRequestPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import AddProduct from './pages/admin/AddProduct';
import SupportWidget from './components/common/SupportWidget';
import MobileBottomNav from './components/ui/MobileBottomNav';

import './styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppProvider openCartDrawer={openCartDrawer}>
          <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Header onCartClick={openCartDrawer} />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:slug" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/returns" element={<ReturnRequestPage />} />
                  <Route path="/orders/:orderNumber" element={<OrderTrackingPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<ProductManagement />} />
                  <Route path="/admin/products/add" element={<AddProduct />} />
                </Routes>
              </main>
              <Footer />
              <RecentlyViewed />
              <PersistentCart />
              <SupportWidget />
              <MobileBottomNav />

              {/* Industrial Nostalgia Cart Drawer */}
              <IndustrialNostalgiaCartDrawer
                isOpen={isCartDrawerOpen}
                onClose={closeCartDrawer}
              />
            </div>
          </Router>
        </AppProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;