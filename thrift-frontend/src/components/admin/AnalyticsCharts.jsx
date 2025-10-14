import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export const RevenueChart = ({ data }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const TopProductsChart = ({ data }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">Top Products</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="quantity" fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const OrderStatusChart = ({ data }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ status, count }) => `${status}: ${count}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export const StatsCards = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="text-sm text-gray-600">Total Revenue</div>
      <div className="text-2xl font-bold text-vintage-600">₹{stats.total_revenue?.toLocaleString()}</div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="text-sm text-gray-600">Total Orders</div>
      <div className="text-2xl font-bold">{stats.total_orders}</div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="text-sm text-gray-600">Completed Orders</div>
      <div className="text-2xl font-bold text-green-600">{stats.completed_orders}</div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="text-sm text-gray-600">Avg Order Value</div>
      <div className="text-2xl font-bold">₹{stats.avg_order_value?.toFixed(2)}</div>
    </div>
  </div>
);
