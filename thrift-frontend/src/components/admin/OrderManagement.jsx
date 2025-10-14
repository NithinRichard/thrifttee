import React, { useState } from 'react';

const OrderManagement = ({ orders, onUpdateStatus, onBulkUpdate, onExport }) => {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');

  const toggleOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleAll = () => {
    setSelectedOrders(prev =>
      prev.length === orders.length ? [] : orders.map(o => o.id)
    );
  };

  const handleBulkUpdate = () => {
    if (selectedOrders.length && bulkStatus) {
      onBulkUpdate(selectedOrders, bulkStatus);
      setSelectedOrders([]);
      setBulkStatus('');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="p-4 bg-vintage-50 border-b flex items-center gap-4">
          <span className="font-medium">{selectedOrders.length} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="">Select Status</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={handleBulkUpdate}
            className="px-4 py-1 bg-vintage-600 text-white rounded hover:bg-vintage-700"
          >
            Update Status
          </button>
          <button
            onClick={() => setSelectedOrders([])}
            className="px-4 py-1 border rounded hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      )}

      {/* Export Button */}
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Orders</h3>
        <button
          onClick={onExport}
          className="px-4 py-2 border rounded hover:bg-gray-50 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === orders.length}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="p-3 text-left">Order #</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleOrder(order.id)}
                    className="rounded"
                  />
                </td>
                <td className="p-3 font-medium">{order.order_number}</td>
                <td className="p-3">
                  <div>{order.shipping_name}</div>
                  <div className="text-sm text-gray-500">{order.shipping_email}</div>
                </td>
                <td className="p-3">₹{order.total_amount}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status}
                  </span>
                </td>
                <td className="p-3 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
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
  );
};

export default OrderManagement;
