import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderTrackingPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`http://localhost:8000/api/v1/orders/?order_number=${orderNumber}`, {
        headers: { Authorization: `Token ${token}` }
      });
      setOrder(res.data.results?.[0] || res.data[0]);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status) + 1;
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!order) return <div className="container mx-auto px-4 py-8">Order not found</div>;

  const currentStep = getStatusStep(order.status);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button onClick={() => navigate('/profile')} className="text-vintage-600 mb-4">← Back to Orders</button>
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-vintage text-vintage-600 mb-2">Order Tracking</h1>
        <p className="text-gray-600 mb-6">Order #{order.order_number}</p>

        {/* Status Timeline */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {['Pending', 'Processing', 'Shipped', 'Delivered'].map((label, idx) => (
              <div key={idx} className="flex-1 text-center">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  idx + 1 <= currentStep ? 'bg-vintage-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {idx + 1 <= currentStep ? '✓' : idx + 1}
                </div>
                <p className="text-xs mt-2">{label}</p>
              </div>
            ))}
          </div>
          <div className="relative">
            <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full"></div>
            <div className="absolute top-0 left-0 h-1 bg-vintage-600 transition-all" style={{ width: `${(currentStep - 1) * 33.33}%` }}></div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <p className="text-sm text-gray-600">{order.shipping_name}</p>
            <p className="text-sm text-gray-600">{order.shipping_address_line1}</p>
            <p className="text-sm text-gray-600">{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <p className="text-sm text-gray-600">Subtotal: ₹{order.subtotal}</p>
            <p className="text-sm text-gray-600">Tax: ₹{order.tax_amount}</p>
            <p className="text-sm text-gray-600">Shipping: ₹{order.shipping_amount}</p>
            <p className="text-sm font-semibold mt-2">Total: ₹{order.total_amount}</p>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="font-semibold mb-4">Items</h3>
          {order.items?.map(item => (
            <div key={item.id} className="flex items-center gap-4 border-b py-4">
              <div className="flex-1">
                <p className="font-medium">{item.product_title}</p>
                <p className="text-sm text-gray-600">
                  {typeof item.product_brand === 'string' ? item.product_brand : item.product_brand?.name || 'Brand'} • Size: {item.product_size?.toUpperCase()}
                </p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold">₹{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
