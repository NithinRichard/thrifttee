import React from 'react';

export const StockIndicator = ({ stock }) => {
  if (stock > 5) return null;
  
  return (
    <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
      <span>🔥</span>
      <span>Only {stock} left!</span>
    </div>
  );
};

export const ViewsIndicator = ({ views }) => {
  if (!views || views < 20) return null;
  
  return (
    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
      <span>👀</span>
      <span>{views}+ viewing</span>
    </div>
  );
};

export const RecentPurchaseIndicator = ({ count, timeframe = '24h' }) => {
  if (!count) return null;
  
  return (
    <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1">
      <span>✓</span>
      <span>{count} sold in last {timeframe}</span>
    </div>
  );
};

export const TrendingBadge = () => (
  <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1">
    <span>🔥</span>
    <span>Trending</span>
  </div>
);

const UrgencyIndicators = ({ product }) => (
  <div className="flex flex-wrap gap-2">
    <StockIndicator stock={product.stock} />
    <ViewsIndicator views={product.views} />
    <RecentPurchaseIndicator count={product.recent_purchases} />
    {product.is_trending && <TrendingBadge />}
  </div>
);

export default UrgencyIndicators;
