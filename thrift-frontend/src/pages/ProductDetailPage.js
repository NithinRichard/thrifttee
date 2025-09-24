
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { formatINR } from '../utils/currency';
import { DEFAULT_PRODUCT_IMAGE } from '../utils/media';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { state, actions } = useApp();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        actions.setLoading(true);
        const productData = await apiService.getProductBySlug(slug);
        setProduct(productData);

        if (productData && productData.category) {
          const relatedData = await apiService.getProducts({
            category: productData.category.slug,
          });
          const relatedList = (relatedData.results || relatedData)
            .filter((p) => p.id !== productData.id)
            .slice(0, 4);
          setRelatedProducts(relatedList);
        }
      } catch (error) {
        actions.setError('Failed to load product details');
      } finally {
        actions.setLoading(false);
      }
    };

    loadProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      actions.addToCart(product);
    }
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{state.error}</div>
        <Link to="/" className="btn-primary">
          Go to Homepage
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-xl mb-4">Product not found</div>
        <Link to="/products" className="btn-primary">
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <img
                  src={(product.all_images && product.all_images[0]) || product.primary_image || DEFAULT_PRODUCT_IMAGE}
                  alt={product.title}
                  className="w-full h-auto object-cover rounded-lg"
                />
              </div>
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h1 className="text-4xl font-vintage font-bold text-gray-900 mb-4">
                {product.title}
              </h1>
              <div className="text-3xl font-bold text-vintage-600 mb-6">
                {formatINR(product.price)}
              </div>
              <p className="text-gray-700 text-lg mb-8">
                {product.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-bold text-gray-600">Category</div>
                  <div className="text-gray-800">
                    {typeof product.category === 'object' && product.category?.name
                      ? product.category.name
                      : product.category || 'N/A'}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-bold text-gray-600">Condition</div>
                  <div className="text-gray-800">{product.condition || 'N/A'}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-bold text-gray-600">Size</div>
                  <div className="text-gray-800">
                    {(() => {
                      if (typeof product.size === 'object' && product.size !== null) {
                        return product.size.name || product.size.value || 'N/A';
                      }
                      return product.size || 'N/A';
                    })()}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-bold text-gray-600">Brand</div>
                  <div className="text-gray-800">
                    {(() => {
                      if (typeof product.brand === 'object' && product.brand !== null) {
                        return product.brand.name || product.brand.title || 'N/A';
                      }
                      return product.brand || 'N/A';
                    })()}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-primary w-full text-lg py-3"
              >
                Add to Cart
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-24"
          >
            <h2 className="text-3xl font-vintage font-bold text-gray-900 mb-8 text-center">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
