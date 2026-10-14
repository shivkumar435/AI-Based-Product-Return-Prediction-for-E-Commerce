import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import orderService from '../services/orderService';
import PageTransition from '../components/PageTransition';
import toast from 'react-hot-toast';
import PriceDisplay from '../components/PriceDisplay';

const ADDRESSES = [
  { id: 1, type: 'Home', name: 'John Doe', address: '123 Main St, Apt 4B', city: 'New York', state: 'NY', zip: '10001', phone: '+1 234-567-8900' },
  { id: 2, type: 'Work', name: 'John Doe', address: '456 Tech Park, Floor 5', city: 'San Francisco', state: 'CA', zip: '94105', phone: '+1 987-654-3210' }
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(ADDRESSES[0].id);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeItems = cart.filter(item => !item.savedForLater);

  useEffect(() => {
    if (activeItems.length === 0 && !isSubmitting) {
      navigate('/cart');
    }
  }, [activeItems.length, navigate, isSubmitting]);

  const subtotal = cartTotal;
  const discount = 0; 
  const tax = subtotal * 0.18;
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal - discount + tax + shipping;

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      // Create order for each item
      const orderPromises = activeItems.map(item => {
        return orderService.createOrder({
          product: item.product._id || item.product.id,
          quantity: item.quantity,
          paymentMethod: paymentMethod,
          discount: item.product.discount || 0,
          deliveryTime: 3,
          customerRating: 5,
          previousReturns: 0,
          customerAge: 30,
          gender: 'Male',
          shippingDistance: 50,
          orderFrequency: 5
        });
      });

      const results = await Promise.all(orderPromises);
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/order-confirmation', { state: { order: results[0] } });
    } catch (error) {
      console.error(error);
      toast.error('Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Shipping Address' },
    { num: 2, title: 'Payment Method' },
    { num: 3, title: 'Review & Place' }
  ];

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Checkout</h1>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 dark:bg-slate-700 -z-10 transform -translate-y-1/2"></div>
          {steps.map((s, i) => (
            <div key={s.num} className="flex flex-col items-center bg-white dark:bg-slate-950 px-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= s.num ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400'}`}>
                {step > s.num ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> : s.num}
              </div>
              <span className={`mt-2 text-xs font-semibold ${step >= s.num ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>{s.title}</span>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Select Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ADDRESSES.map(addr => (
                    <div 
                      key={addr.id} 
                      onClick={() => setSelectedAddress(addr.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-500'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300">{addr.type}</span>
                        {selectedAddress === addr.id && <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white mb-1">{addr.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{addr.address}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{addr.city}, {addr.state} {addr.zip}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{addr.phone}</p>
                    </div>
                  ))}
                  <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-700 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 hover:border-indigo-300 cursor-pointer transition-all min-h-[160px]">
                    <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    <span className="font-medium">Add New Address</span>
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button onClick={() => setStep(2)} disabled={!selectedAddress} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50">Continue to Payment</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Payment Method</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {['Credit Card', 'Debit Card', 'UPI', 'Net Banking'].map(method => (
                    <div 
                      key={method} 
                      onClick={() => setPaymentMethod(method)}
                      className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all ${paymentMethod === method ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-400' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300'}`}
                    >
                      <span className="font-semibold text-sm">{method}</span>
                    </div>
                  ))}
                </div>

                {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                  <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500" value={cardDetails.number} onChange={e => setCardDetails({...cardDetails, number: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry (MM/YY)</label>
                        <input type="text" placeholder="MM/YY" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500" value={cardDetails.expiry} onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                        <input type="password" placeholder="123" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500" value={cardDetails.cvv} onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name on Card</label>
                      <input type="text" placeholder="John Doe" className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500" value={cardDetails.name} onChange={e => setCardDetails({...cardDetails, name: e.target.value})} />
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(1)} className="px-6 py-3 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Back</button>
                  <button onClick={() => setStep(3)} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">Review Order</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Review & Place Order</h2>
                
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-4">Items in Order ({activeItems.length})</h3>
                      <div className="space-y-4">
                        {activeItems.map(item => {
                          const product = item?.product || item;
                          const productId = product?._id || product?.id;
                          if (!productId) return null;

                          return (
                          <div key={item._id || productId} className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                              {product.image && <img src={product.image} className="w-full h-full object-cover" alt={product.name || 'Product'} />}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">{product.name || 'Unnamed product'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <PriceDisplay price={(product.price || 0) * item.quantity} size="sm" />
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Shipping To</h3>
                          <button onClick={() => setStep(1)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button>
                        </div>
                        {(() => {
                          const addr = ADDRESSES.find(a => a.id === selectedAddress);
                          return addr ? (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p className="font-medium text-slate-800 dark:text-gray-200">{addr.name}</p>
                              <p>{addr.address}</p>
                              <p>{addr.city}, {addr.state} {addr.zip}</p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Payment</h3>
                          <button onClick={() => setStep(2)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button>
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{paymentMethod}</p>
                        {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Card ending in {cardDetails.number ? cardDetails.number.slice(-4) : '****'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-xl border border-gray-100 dark:border-slate-700">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-4">Order Summary</h3>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                        <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Tax (18%)</span><span>${tax.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
                      </div>
                      
                      <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-xs">
                        <div className="flex items-center justify-between text-indigo-800 dark:text-indigo-300 font-semibold mb-1">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            Est. Delivery
                          </span>
                          <span>3–7 Business Days</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                          Calculated from order confirmation (skipping weekends).
                        </p>
                      </div>

                      <div className="flex justify-between items-center mb-6">
                        <span className="font-bold text-slate-900 dark:text-white">Total</span>
                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${total.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={handlePlaceOrder} 
                        disabled={isSubmitting}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Processing...
                          </>
                        ) : 'Place Order'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
