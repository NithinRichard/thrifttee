import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import ParallaxHero from '../components/common/ParallaxHero';
import ProductCard from '../components/product/ProductCard';
import apiService from '../services/api';

const HomePage = () => {
  const { state, actions } = useApp();

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        actions.setLoading(true);
        const response = await apiService.getProducts({ is_featured: true });
        actions.setFeaturedProducts(response.results || response);
      } catch (error) {
        console.error('Error loading featured products:', error);
        actions.setError('Failed to load featured products');
      } finally {
        actions.setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []); // Removed actions dependency since actions are now memoized

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <ParallaxHero />

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-vintage font-bold text-gray-900 mb-4">
              Featured Finds
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of unique vintage t-shirts, 
              each with its own story and character.
            </p>
          </motion.div>

          {state.loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {state.featuredProducts.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              to="/products"
              className="btn-primary text-lg px-8 py-3 inline-block"
            >
              Shop All Products
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gradient-vintage">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-vintage font-bold text-gray-900 mb-6">
                Sustainable Fashion with Character
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Every t-shirt in our collection has been carefully selected for its 
                quality, uniqueness, and story. We believe in giving pre-loved clothing 
                a second chance while helping you express your individual style.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-vintage-600 mb-2">500+</div>
                  <div className="text-gray-600">Unique Pieces</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-vintage-600 mb-2">100%</div>
                  <div className="text-gray-600">Quality Checked</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-vintage font-bold text-gray-900 mb-4">
                  Why Choose ThriftTees?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-vintage-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Authentic vintage pieces
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-vintage-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Eco-friendly shopping
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-vintage-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Affordable prices
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-vintage-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Fast shipping
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;