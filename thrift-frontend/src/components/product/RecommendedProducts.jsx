import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import { motion } from 'framer-motion';

const RecommendedProducts = ({ currentProduct }) => {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        setLoading(true);
        const response = await apiService.get(`/products/?category=${currentProduct.category}&limit=4`);
        const filtered = response.results?.filter(p => p.id !== currentProduct.id).slice(0, 4) || [];
        setRecommended(filtered);
      } catch (error) {
        console.error('Error fetching recommended products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentProduct) {
      fetchRecommended();
    }
  }, [currentProduct]);

  if (loading || recommended.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">You Might Also Like</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommended.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <Link to={`/products/${product.slug}`}>
              <img
                src={product.images?.[0]?.image || '/placeholder.jpg'}
                alt={product.title}
                className="w-full aspect-square object-cover"
              />
              <div className="p-3">
                <h4 className="font-medium text-sm text-gray-900 truncate">{product.title}</h4>
                <p className="text-xs text-gray-600">{product.brand?.name}</p>
                <p className="text-lg font-bold text-vintage-600 mt-1">₹{product.price}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
