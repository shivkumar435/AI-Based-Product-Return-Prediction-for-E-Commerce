import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import PageTransition from '../components/PageTransition';
import EmptyState from '../components/EmptyState';
import PriceDisplay from '../components/PriceDisplay';
import { SkeletonCard } from '../components/SkeletonLoader';

export default function CartPage() {
  const { cart, cartSubtotal, cartDiscountTotal, cartTotal, updateQuantity, removeItem, toggleSaveForLater, loading } = useCart();
  const navigate = useNavigate();

  const activeItems = cart.filter(item => !item.savedForLater);
  const savedItems = cart.filter(item => item.savedForLater);

  const subtotal = Number(cartSubtotal || 0);
  const discount = Number(cartDiscountTotal || 0);
  const tax = Math.max(0, (subtotal - discount) * 0.18);
  const total = Math.max(0, cartTotal + tax);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div><SkeletonCard /></div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <EmptyState 
            icon={<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
            title="Your cart is empty"
            description="Looks like you haven't added anything to your cart yet."
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Shopping Cart</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {activeItems.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {activeItems.map((item) => {
                    const product = item?.product || item;
                    const productId = product?._id || product?.id;
                    if (!productId) return null;

                    return (
                      <motion.div
                        key={item._id || productId}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800"
                      >
                        <Link to={`/products/${productId}`} className="w-24 h-24 flex-shrink-0 bg-gray-50 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} alt={product.name || 'Product'} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          )}
                        </Link>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <Link to={`/products/${productId}`}>
                                <h3 className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">{product.name || 'Unnamed product'}</h3>
                              </Link>
                              <PriceDisplay price={product.price || 0} size="md" />
                            </div>
                            {product.brand && <p className="text-sm text-gray-500 dark:text-gray-400">{product.brand}</p>}
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg">
                              <button onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))} className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-l-lg">-</button>
                              <span className="px-3 py-1 text-sm font-medium border-x border-gray-200 dark:border-slate-700 text-slate-900 dark:text-white">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item._id, Math.min((product?.stock || 9999), item.quantity + 1))} className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-r-lg">+</button>
                            </div>
                            <div className="flex items-center gap-4">
                              <button onClick={() => toggleSaveForLater(item._id)} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">Save for Later</button>
                              <button onClick={() => removeItem(item._id)} className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">Remove</button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                <p className="text-gray-500 dark:text-gray-400">No active items in your cart.</p>
              </div>
            )}

            {savedItems.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Saved for Later ({savedItems.length})</h2>
                <div className="space-y-4">
                  {savedItems.map((item) => {
                    const product = item?.product || item;
                    const productId = product?._id || product?.id;
                    if (!productId) return null;

                    return (
                      <div key={item._id || productId} className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 opacity-75 hover:opacity-100 transition-opacity">
                        <div className="w-20 h-20 flex-shrink-0 bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
                          {product.image && <img src={product.image} alt={product.name || 'Product'} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{product.name || 'Unnamed product'}</h3>
                            <PriceDisplay price={product.price || 0} size="sm" />
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <button onClick={() => toggleSaveForLater(item._id)} className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Move to Cart</button>
                            <button onClick={() => removeItem(item._id)} className="text-sm font-medium text-red-600 dark:text-red-400">Remove</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-96">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-6 border-b border-gray-100 dark:border-slate-800 pb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">-${discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (18%)</span>
                  <span className="font-medium text-slate-900 dark:text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600 dark:text-green-400">Free</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${total.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                disabled={activeItems.length === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl font-bold transition-colors shadow-md shadow-indigo-500/20"
              >
                Proceed to Checkout
              </button>
              
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                Secure checkout (Simulated Payment)
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
