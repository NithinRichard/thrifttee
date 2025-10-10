// Skeleton Loading Components for Better UX
import React from 'react';
import { motion } from 'framer-motion';

export const ProductCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
  >
    <div className="aspect-square bg-gray-300"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-6 bg-gray-300 rounded w-1/4"></div>
    </div>
  </motion.div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-300 rounded-lg"></div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>

          {/* Size Selection Skeleton */}
          <div className="space-y-3">
            <div className="h-5 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>

          {/* CTA Buttons Skeleton */}
          <div className="flex space-x-4">
            <div className="h-12 bg-gray-300 rounded flex-1"></div>
            <div className="h-12 bg-gray-300 rounded flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const FiltersSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm space-y-6 animate-pulse">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-3">
        <div className="h-5 bg-gray-300 rounded w-1/3"></div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
