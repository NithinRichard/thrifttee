import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddProduct = () => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand: '',
    category: '',
    size: 'm',
    color: '',
    material: '100% Cotton',
    gender: 'unisex',
    condition: 'excellent',
    price: '',
    original_price: '',
    quantity: 1,
    is_available: true,
    is_featured: false
  });
  const [primaryImage, setPrimaryImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-vintage-600 focus:border-transparent";

  useEffect(() => {
    fetchBrandsAndCategories();
  }, []);

  const fetchBrandsAndCategories = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const [brandsRes, categoriesRes] = await Promise.all([
        axios.get('http://localhost:8000/api/v1/products/brands/', {
          headers: { Authorization: `Token ${token}` }
        }),
        axios.get('http://localhost:8000/api/v1/products/categories/', {
          headers: { Authorization: `Token ${token}` }
        })
      ]);
      setBrands(Array.isArray(brandsRes.data) ? brandsRes.data : brandsRes.data.results || []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data.results || []);
    } catch (error) {
      console.error('Failed to fetch brands/categories:', error);
      setBrands([]);
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    setPrimaryImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      if (primaryImage) {
        data.append('primary_image', primaryImage);
      }

      await axios.post('http://localhost:8000/api/admin/products/', data, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Product added successfully!');
      navigate('/admin/products');
    } catch (error) {
      alert('Failed to add product: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-vintage text-vintage-600 mb-2">Add New Product</h1>
        <p className="text-gray-600">Add a new vintage t-shirt to your collection</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Brand *</label>
            <select name="brand" value={formData.brand} onChange={handleChange} required className={inputClass}>
              <option value="">Select Brand</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Size *</label>
            <select name="size" value={formData.size} onChange={handleChange} required className={inputClass}>
              <option value="xs">XS</option>
              <option value="s">S</option>
              <option value="m">M</option>
              <option value="l">L</option>
              <option value="xl">XL</option>
              <option value="xxl">XXL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color *</label>
            <input type="text" name="color" value={formData.color} onChange={handleChange} required className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Material</label>
            <input type="text" name="material" value={formData.material} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
              <option value="unisex">Unisex</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Condition *</label>
            <select name="condition" value={formData.condition} onChange={handleChange} required className={inputClass}>
              <option value="new_with_tags">New with Tags</option>
              <option value="new_without_tags">New without Tags</option>
              <option value="excellent">Excellent</option>
              <option value="very_good">Very Good</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price (₹) *</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Original Price (₹)</label>
            <input type="number" name="original_price" value={formData.original_price} onChange={handleChange} min="0" step="0.01" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Quantity *</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Primary Image *</label>
            <input type="file" accept="image/*" onChange={handleImageChange} required className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description *</label>
          <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" className={inputClass} />
        </div>

        <div className="flex items-center space-x-6">
          <label className="flex items-center">
            <input type="checkbox" name="is_available" checked={formData.is_available} onChange={handleChange} className="mr-2" />
            Available
          </label>
          <label className="flex items-center">
            <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="mr-2" />
            Featured
          </label>
        </div>

        <div className="flex space-x-4 pt-4 border-t">
          <button type="submit" disabled={loading} className="bg-vintage-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-vintage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Adding Product...' : '✓ Add Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
