import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import DataTable from '../components/DataTable';
import { SkeletonTable } from '../components/SkeletonLoader';
import PageTransition from '../components/PageTransition';
import ConfirmModal from '../components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Returned: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
};

const TABS = ['All', 'Pending', 'Shipped', 'Delivered', 'Returned', 'Cancelled'];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  
  const [actionOrder, setActionOrder] = useState(null);
  const [actionType, setActionType] = useState(null); // 'cancel' | 'return'
  const [reason, setReason] = useState('');
  
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAction = async () => {
    if (!actionOrder || !actionType) return;
    try {
      if (actionType === 'cancel') {
        await orderService.cancelOrder(actionOrder._id, reason);
        toast.success('Order cancelled successfully');
      } else if (actionType === 'return') {
        await orderService.requestReturn(actionOrder._id, reason);
        toast.success('Return requested successfully');
      }
      setActionOrder(null);
      setActionType(null);
      setReason('');
      fetchOrders();
    } catch (err) {
      toast.error(`Failed to ${actionType} order`);
    }
  };

  const filteredOrders = activeTab === 'All' ? orders : orders.filter(o => o.status === activeTab);

  const columns = [
    { 
      key: '_id', 
      label: 'Order #', 
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          {(row._id?.toString?.() ?? '').substring(0, 8).toUpperCase()}
        </span>
      ) 
    },
    { 
      key: 'product', 
      label: 'Product', 
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gray-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
            {row.product?.image && <img src={row.product.image} className="w-full h-full object-cover" alt="" />}
          </div>
          <span className="font-medium text-slate-900 dark:text-white line-clamp-1">{row.product?.name || 'Manual Entry'}</span>
        </div>
      ) 
    },
    { key: 'quantity', label: 'Qty', render: (row) => row.quantity },
    { key: 'totalPrice', label: 'Total', render: (row) => `$${(row.totalPrice || 0).toFixed(2)}` },
    { 
      key: 'prediction', 
      label: 'Return Risk', 
      render: (row) => {
        if (row.isFallback || row.prediction === 'Unavailable') {
          return (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Unavailable
            </span>
          );
        }
        const prob = row.probability || 0;
        const isHigh = prob > 50;
        return (
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${isHigh ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
            {prob.toFixed(1)}%
          </span>
        );
      }
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (row) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[row.status] || STATUS_COLORS.Pending}`}>
          {row.status || 'Pending'}
        </span>
      )
    },
    {
      key: 'delivery',
      label: 'Delivery Date',
      render: (row) => {
        if (row.status === 'Delivered') {
          const actDate = row.actualDeliveryDate || row.updatedAt;
          return (
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Delivered: {actDate ? new Date(actDate).toLocaleDateString() : 'Delivered'}
            </span>
          );
        }
        if (row.status === 'Cancelled') {
          return <span className="text-xs text-gray-400">Cancelled</span>;
        }
        if (row.status === 'Returned' || row.status === 'Return Requested' || row.status === 'Refunded') {
          return <span className="text-xs text-amber-600 dark:text-amber-400">{row.status}</span>;
        }
        if (row.estimatedDelivery) {
          return (
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              Est: {new Date(row.estimatedDelivery).toLocaleDateString()}
            </span>
          );
        }
        return <span className="text-xs text-gray-500">3–7 business days</span>;
      }
    },
    { key: 'date', label: 'Placed On', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <Link to={`/orders/${row._id}`} className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition">
            View
          </Link>
          {(row.status === 'Pending' || row.status === 'Confirmed') && (
            <button 
              onClick={(e) => { e.preventDefault(); setActionOrder(row); setActionType('cancel'); }} 
              className="px-3 py-1 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/20 transition"
            >
              Cancel
            </button>
          )}
          {row.status === 'Delivered' && (
            <button 
              onClick={(e) => { e.preventDefault(); setActionOrder(row); setActionType('return'); }} 
              className="px-3 py-1 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 rounded text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/20 transition"
            >
              Return
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Order History</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage your orders</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar border-b border-gray-200 dark:border-slate-800">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="orderTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          ))}
        </div>

        {loading ? <SkeletonTable /> : (
          filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-16 text-center shadow-sm">
              <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No orders found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {activeTab === 'All' ? 'You haven\'t placed any orders yet.' : `You have no ${activeTab.toLowerCase()} orders.`}
              </p>
              {activeTab === 'All' && (
                <Link to="/products" className="mt-6 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                  Start Shopping
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
              <div onClick={(e) => {
                // If a row is clicked and it's an A or BUTTON tag, let it go. Else, if we can detect the tr, navigate.
                // We'll just rely on DataTable's native support if we implemented onRowClick, or use the View button.
              }}>
                <DataTable columns={columns} data={filteredOrders} onRowClick={(row) => navigate(`/orders/${row._id}`)} />
              </div>
            </div>
          )
        )}
      </div>

      <ConfirmModal
        isOpen={!!actionOrder}
        onClose={() => { setActionOrder(null); setActionType(null); setReason(''); }}
        onConfirm={handleAction}
        title={actionType === 'cancel' ? 'Cancel Order' : 'Request Return'}
        confirmText="Submit"
        variant={actionType === 'cancel' ? 'danger' : 'warning'}
        message={
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {actionType === 'cancel' 
                ? 'Are you sure you want to cancel this order? Please provide a reason:'
                : 'Why are you returning this item?'}
            </p>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Changed my mind"
              required
            ></textarea>
          </div>
        }
      />
    </PageTransition>
  );
}
