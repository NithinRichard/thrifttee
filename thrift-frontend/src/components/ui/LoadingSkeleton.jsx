import React from 'react';

export const ProductCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-300 aspect-square rounded-lg mb-3"></div>
    <div className="bg-gray-300 h-4 rounded mb-2"></div>
    <div className="bg-gray-300 h-4 w-2/3 rounded mb-2"></div>
    <div className="bg-gray-300 h-6 w-1/2 rounded"></div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {[...Array(count)].map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="animate-pulse grid md:grid-cols-2 gap-8">
    <div className="bg-gray-300 aspect-square rounded-lg"></div>
    <div className="space-y-4">
      <div className="bg-gray-300 h-8 w-3/4 rounded"></div>
      <div className="bg-gray-300 h-6 w-1/2 rounded"></div>
      <div className="bg-gray-300 h-4 w-full rounded"></div>
      <div className="bg-gray-300 h-4 w-full rounded"></div>
      <div className="bg-gray-300 h-12 w-full rounded"></div>
    </div>
  </div>
);

export default ProductGridSkeleton;
