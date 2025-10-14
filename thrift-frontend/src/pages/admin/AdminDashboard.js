import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StatsCards, RevenueChart, TopProductsChart, OrderStatusChart } from '../../components/admin/AnalyticsCharts';
import OrderManagement from '../../components/admin/OrderManagement';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Fetching admin data with token:', token);
      
      const [analyticsRes, ordersRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/admin/orders/analytics/?days=${days}`, {
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

  const handleBulkUpdate = async (orderIds, status) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        'http://localhost:8000/api/admin/orders/bulk_update_status/',
        { order_ids: orderIds, status },
        { headers: { Authorization: `Token ${token}` } }
      );
      fetchData();
    } catch (error) {
      alert('Failed to bulk update orders');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        'http://localhost:8000/api/admin/orders/export_csv/',
        {
          headers: { Authorization: `Token ${token}` },
          responseType: 'blob'
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'orders.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export orders');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-vintage text-vintage-600 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of your thrift store performance</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="border rounded px-4 py-2"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {analytics && (
        <>
          <StatsCards stats={analytics.stats} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RevenueChart data={analytics.revenue_chart} />
            <TopProductsChart data={analytics.top_products} />
          </div>
          
          <div className="mb-6">
            <OrderStatusChart data={analytics.status_distribution} />
          </div>
        </>
      )}

      <OrderManagement
        orders={orders}
        onUpdateStatus={updateOrderStatus}
        onBulkUpdate={handleBulkUpdate}
        onExport={handleExport}
      />
    </div>
  );
};

export default AdminDashboard;
