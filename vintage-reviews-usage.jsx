// Example usage of the Vintage Reviews System
import React from 'react';
import ProductReviews from './thrift-frontend/src/components/product/ProductReviews';

// Usage in a product detail page
const ProductDetailPage = ({ product }) => {
  return (
    <div className="product-detail-page">
      {/* Product information */}
      <div className="product-info">
        <h1>{product.title}</h1>
        <p>{product.description}</p>
        <div className="price">${product.price}</div>
      </div>

      {/* Product images */}
      <div className="product-images">
        <img src={product.primary_image} alt={product.title} />
      </div>

      {/* Reviews Section - Just add this component */}
      <ProductReviews productId={product.id} />
    </div>
  );
};

export default ProductDetailPage;