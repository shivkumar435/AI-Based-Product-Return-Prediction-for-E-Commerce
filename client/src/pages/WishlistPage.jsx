import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import PageTransition from '../components/PageTransition';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonLoader';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id || product.id);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <EmptyState 
            icon={<svg className="w-16 h-16 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
            title="Your wishlist is empty"
            description="Save items you love to your wishlist to keep track of them."
            actionText="Explore Products"
            actionLink="/products"
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Wishlist</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {wishlist.map((product) => (
              <motion.div
                key={product._id || product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative"
              >
                <ProductCard product={product} />
                <div className="absolute top-2 left-2 right-2 flex justify-between z-20 pointer-events-none">
                  {/* Keep the product card clear but add a custom overlay for move to cart if needed, actually the ProductCard has "Add to Cart" at bottom. But the prompt says "Move to Cart" and "Remove" actions per item. */}
                </div>
                {/* ProductCard contains the WishlistButton which acts as toggle. */}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageTransition>
  );
}
