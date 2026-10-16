import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/orders', { replace: true });
    }
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800"
        >
          <div className="p-8 text-center bg-indigo-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Thank you for your order!</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Order <span className="font-semibold text-indigo-600 dark:text-indigo-400">#{order._id || order.id}</span> has been confirmed.
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Delivery Information</h3>
                <div className="text-gray-600 dark:text-gray-300 space-y-1">
                  <p className="font-medium text-slate-800 dark:text-gray-200">{order.shippingAddress?.fullName || 'Customer'}</p>
                  <p>{order.shippingAddress?.streetAddress}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                  <p>{order.shippingAddress?.country || 'India'}</p>
                  {order.shippingAddress?.phone && <p className="pt-1">Phone: {order.shippingAddress.phone}</p>}
                  <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      Estimated Delivery Date
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '3–7 Business Days (Excluding Weekends)'}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Standard Dispatch (3–7 business days)</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Item</span>
                    <span className="font-medium text-slate-800 dark:text-gray-200">{order.product?.name || (order.items && order.items[0]?.name) || 'Product Order'} (Qty: {order.quantity || 1})</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Payment Method</span>
                    <span>{order.paymentMethod || 'Simulated'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-white pt-3 border-t border-gray-100 dark:border-slate-800">
                    <span>Total</span>
                    <span>${Number(order.totalPrice || order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {(order.prediction || order.probability !== undefined) && (
              <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🤖</span>
                  <div>
                    {order.isFallback || order.prediction === 'Unavailable' ? (
                      <>
                        <h4 className="font-semibold text-indigo-900 dark:text-indigo-300">
                          AI Return Risk: Temporarily Unavailable
                        </h4>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">
                          {order.fallbackReason
                            ? `ML prediction service was offline: ${order.fallbackReason}. Your order was placed successfully without automated risk evaluation.`
                            : 'Order placed successfully. Automated risk prediction is currently offline.'}
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-semibold text-indigo-900 dark:text-indigo-300">
                          AI Return Risk Assessment: {order.riskLevel || (order.probability > 50 ? 'High Risk' : 'Low Risk')} ({Number(order.probability || 0).toFixed(1)}%)
                        </h4>
                        <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">
                          Status: {order.prediction || (order.probability > 50 ? 'Likely to Return' : 'Not Likely to Return')}. Evaluated using our trained machine learning model.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link 
                to={`/orders/${order._id || order.id}`}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium text-center"
              >
                Track Order
              </Link>
              <Link 
                to="/products"
                className="px-8 py-3 bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition font-medium text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
