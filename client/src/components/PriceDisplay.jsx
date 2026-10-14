import React from 'react';

export default function PriceDisplay({ price, originalPrice, size = 'md', currency = '₹' }) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  const formattedPrice = Number(price).toLocaleString('en-IN');
  
  if (originalPrice && originalPrice > price) {
    const formattedOriginal = Number(originalPrice).toLocaleString('en-IN');
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    
    return (
      <div className="flex items-center gap-2">
        <span className={`font-bold text-slate-900 dark:text-white ${sizeClasses[size]}`}>
          {currency}{formattedPrice}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
          {currency}{formattedOriginal}
        </span>
        <span className="text-sm font-medium text-green-600 dark:text-green-400">
          {discount}% off
        </span>
      </div>
    );
  }

  return (
    <span className={`font-bold text-slate-900 dark:text-white ${sizeClasses[size]}`}>
      {currency}{formattedPrice}
    </span>
  );
}
