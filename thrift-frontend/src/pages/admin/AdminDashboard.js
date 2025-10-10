import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Fetching admin data with token:', token);
      
      const [analyticsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:8000/api/admin/orders/analytics/', {
          headers: { Authorization: `Token ${token}` }
        }),
        axios.get('http://localhost:8000/api/admin/orders/', {
          headers: { Authorization: `Token ${token}` }
        })
      ]);
      
      console.log('Analytics:', analyticsRes.data);
      console.log('Orders:', ordersRes.data);
      
      setAnalytics(analyticsRes.data);
      setOrders(ordersRes.data.results || ordersRes.data);
    } catch (error) {
      console.error('Admin fetch error:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        alert('Admin access required. Please login with an admin account.');
        navigate('/login');
      } else {
        alert('Error loading admin data: ' + (error.response?.data?.detail || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `http://localhost:8000/api/admin/orders/${orderId}/update_status/`,
        { status: newStatus },
        { headers: { Authorization: `Token ${token}` } }
      );
      fetchData();
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-vintage text-vintage-600 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your thrift store performance</p>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-vintage-600">
            <h3 className="text-gray-500 text-sm uppercase tracking-wide">Total Orders</h3>
            <p className="text-3xl font-bold text-vintage-600 mt-2">{analytics.total_orders}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-600">
            <h3 className="text-gray-500 text-sm uppercase tracking-wide">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">₹{analytics.total_revenue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-600">
            <h3 className="text-gray-500 text-sm uppercase tracking-wide">Pending Orders</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{analytics.pending_orders}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-600">
            <h3 className="text-gray-500 text-sm uppercase tracking-wide">Last 30 Days</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">₹{analytics.last_30_days_revenue.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold text-vintage-600">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{order.order_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{order.shipping_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">₹{order.total_amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-vintage-600"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
