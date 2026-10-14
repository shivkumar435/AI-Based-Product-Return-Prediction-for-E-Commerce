import React from 'react';
import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';

export default function WishlistButton({ productId, className = '' }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const wishlisted = isInWishlist(productId);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={handleToggle}
      className={`p-2 rounded-full flex items-center justify-center transition-colors ${
        wishlisted 
          ? 'text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50' 
          : 'text-gray-400 bg-white/80 hover:bg-gray-100 dark:bg-slate-800/80 dark:hover:bg-slate-700'
      } ${className}`}
    >
      <svg className="w-5 h-5" fill={wishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={wishlisted ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </motion.button>
  );
}
