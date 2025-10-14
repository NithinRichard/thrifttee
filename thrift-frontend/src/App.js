import React, { useState, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import SupportWidget from './components/common/SupportWidget';
import MobileBottomNav from './components/ui/MobileBottomNav';
import { initGA, trackPageView } from './utils/analytics';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './styles/globals.css';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const ReturnRequestPage = lazy(() => import('./pages/ReturnRequestPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement'));
const AddProduct = lazy(() => import('./pages/admin/AddProduct'));
const RazorpayLoader = lazy(() => import('./components/common/RazorpayLoader'));
const RecentlyViewed = lazy(() => import('./components/ui/RecentlyViewed'));
const PersistentCart = lazy(() => import('./components/ui/PersistentCart'));
const IndustrialNostalgiaCartDrawer = lazy(() => import('./components/cart/IndustrialNostalgiaCartDrawer'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vintage-600"></div>
  </div>
);

const AnalyticsTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  
  return null;
};

function App() {
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    // Initialize Google Analytics
    if (process.env.REACT_APP_GA_MEASUREMENT_ID) {
      initGA(process.env.REACT_APP_GA_MEASUREMENT_ID);
    }
    
    // Register service worker for PWA
    serviceWorkerRegistration.register();
  }, []);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppProvider openCartDrawer={openCartDrawer}>
          <Router>
            <AnalyticsTracker />
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Header onCartClick={openCartDrawer} />
              <main className="flex-grow">
                <Suspense fallback={<LoadingFallback />}>
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
                </Suspense>
              </main>
              <Footer />
              <Suspense fallback={null}>
                <RecentlyViewed />
                <PersistentCart />
                <SupportWidget />
                <MobileBottomNav />
                <RazorpayLoader />
                <IndustrialNostalgiaCartDrawer
                  isOpen={isCartDrawerOpen}
                  onClose={closeCartDrawer}
                />
              </Suspense>
            </div>
          </Router>
        </AppProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;