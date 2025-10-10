import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Fetching products with token:', token);
      
      const res = await axios.get('http://localhost:8000/api/admin/products/', {
        headers: { Authorization: `Token ${token}` }
      });
      
      console.log('Products response:', res.data);
      setProducts(res.data.results || res.data);
    } catch (error) {
      console.error('Failed to fetch products:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        alert('Admin access required. Please login with an admin account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, newQuantity) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `http://localhost:8000/api/admin/products/${productId}/update_stock/`,
        { quantity: newQuantity },
        { headers: { Authorization: `Token ${token}` } }
      );
      fetchProducts();
    } catch (error) {
      alert('Failed to update stock');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-vintage text-vintage-600 mb-2">Product Management</h1>
          <p className="text-gray-600">Manage your vintage t-shirt inventory</p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/products/add'}
          className="bg-vintage-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-vintage-700 transition-colors"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img src={product.primary_image} alt={product.title} className="w-12 h-12 object-cover rounded mr-3" />
                    <div>
                      <div className="font-medium">{product.title}</div>
                      <div className="text-sm text-gray-500">{product.brand?.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">₹{product.price}</td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => updateStock(product.id, e.target.value)}
                    className="border rounded px-2 py-1 w-20"
                    min="0"
                  />
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_available ? 'Available' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-400 text-sm">-</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;
