
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/media';
import { formatOrderTimestamp } from '../utils/datetime';

const ProfilePage = () => {
  const { state, actions } = useApp();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        actions.setLoading(true);
        const response = await apiService.getOrders();
        setOrders(response.results || response);
      } catch (error) {
        actions.setError('Failed to load orders');
      } finally {
        actions.setLoading(false);
      }
    };

    if (state.isAuthenticated) {
      loadOrders();
    }
  }, [state.isAuthenticated, actions]);

  if (!state.isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500 mb-6">Please log in to view your profile</p>
        <Link to="/login" className="btn-primary">
          Login
        </Link>
      </div>
    );
  }

  const hasOrders = Array.isArray(orders) && orders.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-vintage font-bold text-gray-900 mb-8">
            Welcome, {state.user?.full_name || 'User'}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Details */}
            <div className="lg:col-span-1 bg-white p-8 rounded-lg shadow-lg h-fit">
              <h2 className="text-2xl font-vintage font-bold text-gray-900 mb-6">
                Your Details
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="font-bold text-gray-600">Full Name</div>
                  <div className="text-gray-800">{state.user?.full_name}</div>
                </div>
                <div>
                  <div className="font-bold text-gray-600">Email</div>
                  <div className="text-gray-800">{state.user?.email}</div>
                </div>
              </div>
              <button 
                onClick={() => actions.logout()} 
                className="btn-secondary w-full mt-8"
              >
                Logout
              </button>
            </div>

            {/* Order History */}
            <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-vintage font-bold text-gray-900 mb-6">
                Order History
              </h2>
              {state.loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="loading-spinner"></div>
                </div>
              ) : !hasOrders ? (
                <p className="text-gray-500">You haven't placed any orders yet.</p>
              ) : (
                <div className="space-y-6">
                  {orders.map(order => (
                    <div key={order.id} className="border border-gray-200 p-6 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div className="font-bold text-gray-800">Order #{order.order_number || order.id}</div>
                          <div className="text-sm text-gray-500">
                            <span title={new Date(order.created_at).toLocaleString('en-IN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true
                            })}>
                              {formatOrderTimestamp(order.created_at)}
                            </span>
                            {order.updated_at && new Date(order.updated_at).getTime() !== new Date(order.created_at).getTime() && (
                              <span className="ml-2 text-xs text-gray-400">
                                (Updated {formatOrderTimestamp(order.updated_at)})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            Status: <span className={`font-semibold ${
                              order.status === 'delivered' ? 'text-green-600' :
                              order.status === 'shipped' ? 'text-blue-600' :
                              order.status === 'processing' ? 'text-yellow-600' :
                              order.status === 'cancelled' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {order.status
                                ? `${order.status.charAt(0).toUpperCase()}${order.status.slice(1)}`
                                : 'Unknown'}
                            </span>
                            {order.shipped_at && (
                              <span className="ml-2 text-blue-500">
                                • Shipped {formatOrderTimestamp(order.shipped_at)}
                              </span>
                            )}
                            {order.delivered_at && (
                              <span className="ml-2 text-green-500">
                                • Delivered {formatOrderTimestamp(order.delivered_at)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-vintage-600">
                            ₹{Number(order.total_amount ?? order.total_price ?? 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.payment_status === 'completed' ? 'Paid' : `Payment ${order.payment_status || 'pending'}`}
                          </div>
                        </div>
                      </div>
                      <div>
                        {(order.items || order.order_items || []).map(item => (
                          <div key={item.id} className="flex items-center py-2">
                            <img
                              src={item.product?.image || item.image || DEFAULT_PRODUCT_IMAGE}
                              alt={item.product?.title || item.product_title || 'Product'}
                              className="w-12 h-12 object-cover rounded-md mr-4"
                            />
                            <div>
                              <div className="font-bold text-gray-700">
                                {item.product?.title || item.product_title || 'Product'}
                              </div>
                              <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
