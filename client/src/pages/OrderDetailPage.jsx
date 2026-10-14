import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import orderService from '../services/orderService';
import PageTransition from '../components/PageTransition';
import StatusBadge from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';
import ConfirmModal from '../components/ConfirmModal';
import PriceDisplay from '../components/PriceDisplay';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrder(id);
        setOrder(data);
      } catch (err) {
        toast.error('Failed to load order details');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  const handleCancel = async () => {
    try {
      await orderService.cancelOrder(id, reason);
      toast.success('Order cancelled successfully');
      setOrder(await orderService.getOrder(id));
      setIsCancelModalOpen(false);
      setReason('');
    } catch (err) {
      toast.error('Failed to cancel order');
    }
  };

  const handleReturn = async () => {
    try {
      await orderService.requestReturn(id, reason);
      toast.success('Return requested successfully');
      setOrder(await orderService.getOrder(id));
      setIsReturnModalOpen(false);
      setReason('');
    } catch (err) {
      toast.error('Failed to request return');
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const invoiceData = await orderService.getInvoice(id);
      const invoice = invoiceData?.data || invoiceData;
      
      const invoiceHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice #${(order._id?.toString?.() ?? '').substring(0, 8)}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #4338ca; }
            .meta { font-size: 14px; color: #64748b; }
            .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .table th, .table td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            .table th { background: #f8fafc; font-weight: 600; }
            .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; color: #0f172a; }
            .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">ReturnSense E-Commerce</div>
              <div class="meta">AI-Based Return Risk Management</div>
            </div>
            <div style="text-align: right;">
              <p><strong>Invoice Date:</strong> ${new Date(invoice?.date || order.createdAt).toLocaleDateString()}</p>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>
          </div>
          <div style="margin-top: 24px;">
            <p><strong>Billed To:</strong> ${invoice?.customer?.name || order.user?.name || 'Customer'}</p>
            <p><strong>Email:</strong> ${invoice?.customer?.email || order.user?.email || 'N/A'}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Credit Card'}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="width: 80px;">Qty</th>
                <th style="width: 120px;">Unit Price</th>
                <th style="width: 120px;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${order.product?.name || 'Item'}</td>
                <td>${order.quantity || 1}</td>
                <td>$${Number(order.product?.price || order.totalPrice || 0).toFixed(2)}</td>
                <td>$${Number(order.totalPrice || 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">Total Amount: $${Number(order.totalPrice || 0).toFixed(2)}</div>
          <div class="footer">
            Thank you for your business! ReturnSense AI-Powered E-Commerce Platform.
          </div>
        </body>
        </html>
      `;
      const blob = new Blob([invoiceHtml], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) {
        win.focus();
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${(order._id?.toString?.() ?? '').substring(0, 8)}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      toast.success('Invoice generated successfully');
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-20 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="h-40 bg-gray-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  if (!order) return null;

  const prob = order.probability ?? order.probability ?? 0;
  const riskFactors = order.riskFactors ?? order.risk_factors ?? [];
  
  // Create mock history if statusHistory doesn't exist
  const statusHistory = order.statusHistory || [
    { status: 'Pending', date: order.createdAt },
    ...(order.status !== 'Pending' ? [{ status: order.status, date: new Date() }] : [])
  ];

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order #{(order._id?.toString?.() ?? '').substring(0, 8).toUpperCase()}</h1>
              <StatusBadge status={order.status || 'Pending'} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <button 
            onClick={handleDownloadInvoice}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Download Invoice
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mb-8">
          {/* Delivery & Schedule Information */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-b border-gray-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                  Delivery Status & Schedule
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {order.status === 'Delivered' 
                    ? `Delivered on ${order.actualDeliveryDate ? new Date(order.actualDeliveryDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Delivered'}`
                    : order.status === 'Cancelled'
                    ? 'Order Cancelled — Delivery Aborted'
                    : order.status === 'Returned' || order.status === 'Return Requested'
                    ? `${order.status} (Delivered on ${order.actualDeliveryDate ? new Date(order.actualDeliveryDate).toLocaleDateString() : 'N/A'})`
                    : `Estimated Delivery: ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '3–7 Business Days'}`}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {order.status === 'Pending' && 'Order placed. Awaiting merchant confirmation.'}
                  {order.status === 'Confirmed' && 'Order confirmed. Delivery estimated within 3–7 business days (weekends excluded).'}
                  {order.status === 'Packed' && 'Item packed and staged for shipment dispatch.'}
                  {order.status === 'Shipped' && 'Order dispatched. In transit to destination.'}
                  {order.status === 'Out for Delivery' && 'Courier out for delivery today.'}
                  {order.status === 'Delivered' && 'Package successfully handed over to customer.'}
                  {order.status === 'Cancelled' && `Order cancelled with reason: ${order.cancelReason || 'Customer requested'}.`}
                  {order.status === 'Return Requested' && `Return request submitted: "${order.returnReason || 'Under merchant review'}".`}
                  {order.status === 'Returned' && 'Return accepted and processed.'}
                </p>
              </div>

              {/* Courier info (honest reporting) */}
              <div className="text-right sm:text-right text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Carrier / Tracking</span>
                {order.trackingNumber && order.carrier ? (
                  <span className="font-semibold text-slate-900 dark:text-white">{order.carrier} — #{order.trackingNumber}</span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400 italic">Standard Local Dispatch (No external courier API connected)</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Status Timeline</h3>
            <OrderTimeline statusHistory={statusHistory} currentStatus={order.status || 'Pending'} />
          </div>
          
          <div className="p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Items</h2>
            <div className="flex gap-4 items-center bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                {order.product?.image && <img src={order.product.image} className="w-full h-full object-cover" alt="" />}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">{order.product?.name || 'Unknown Product'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Qty: {order.quantity}</p>
              </div>
              <div className="text-right">
                <PriceDisplay price={order.product?.price || order.totalPrice / order.quantity} size="md" />
              </div>
            </div>
            
            {/* AI Return Risk Section */}
            <div className="mt-6 p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  AI Return Risk Analysis
                </h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${prob > 50 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                  {prob.toFixed(1)}% Return Risk
                </span>
              </div>
              
              {riskFactors && riskFactors.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {riskFactors.slice(0, 4).map((f, i) => (
                    <div key={i} className="text-sm bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/20">
                      <span className="font-medium text-slate-900 dark:text-white block">{f.feature}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">{f.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Payment & Shipping</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Payment Method</span>
                <span className="font-medium text-slate-900 dark:text-white">{order.paymentMethod || 'Credit Card'}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Shipping Address</span>
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  <p>John Doe</p>
                  <p>123 Main St, Apt 4B</p>
                  <p>New York, NY 10001</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${(order.totalPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax & Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 dark:text-white">Total</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${(order.totalPrice || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          {(order.status === 'Pending' || order.status === 'Confirmed') && (
            <button 
              onClick={() => setIsCancelModalOpen(true)}
              className="px-6 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
              Cancel Order
            </button>
          )}
          {order.status === 'Delivered' && (
            <button 
              onClick={() => setIsReturnModalOpen(true)}
              className="px-6 py-2.5 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 rounded-xl font-medium hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors"
            >
              Request Return
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Order"
        confirmText="Yes, Cancel Order"
        variant="danger"
        message={
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Are you sure you want to cancel this order? Please provide a reason:</p>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Ordered by mistake"
            ></textarea>
          </div>
        }
      />

      <ConfirmModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onConfirm={handleReturn}
        title="Request Return"
        confirmText="Submit Request"
        variant="warning"
        message={
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Why are you returning this item?</p>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Size doesn't fit, item defective"
            ></textarea>
          </div>
        }
      />
    </PageTransition>
  );
}
