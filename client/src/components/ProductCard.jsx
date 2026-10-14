import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import WishlistButton from './WishlistButton';
import RatingStars from './RatingStars';
import PriceDisplay from './PriceDisplay';

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const { addToCart } = useCart();
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.03, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 relative group flex flex-col h-full"
    >
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-800/90 text-indigo-600 dark:text-indigo-400 shadow-sm backdrop-blur-sm border border-indigo-100 dark:border-indigo-900/30">
          {product.category}
        </span>
      </div>
      <div className="absolute top-3 right-3 z-10">
        <WishlistButton productId={product._id || product.id} />
      </div>

      <Link to={`/products/${product._id || product.id}`} className="block h-56 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center relative overflow-hidden">
         {!imgError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
         ) : null}
         <div className={`w-full h-full items-center justify-center ${!imgError && product.image ? 'hidden' : 'flex'}`}>
           <svg className="w-16 h-16 text-indigo-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
         </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow">
        {product.brand && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{product.brand}</span>
        )}
        <Link to={`/products/${product._id || product.id}`}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1 mb-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{product.name}</h3>
        </Link>
        
        <div className="mb-2">
          <RatingStars rating={product.rating || 0} size="sm" showCount count={product.numReviews || 0} />
        </div>
        
        <div className="mb-4 mt-auto">
          <PriceDisplay price={product.price} originalPrice={product.discount > 0 ? product.price / (1 - product.discount/100) : null} size="lg" />
        </div>
        
        <button 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="w-full mb-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
        >
          {isOutOfStock ? 'Out of Stock' : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Add to Cart
            </>
          )}
        </button>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}></span>
            <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {isOutOfStock ? 'Out of Stock' : 'In Stock'}
            </span>
          </div>
          <Link to={`/products/${product._id || product.id}`} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            Details &rarr;
          </Link>
        </div>
      </div>
    </motion.div>
  );
}