import { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../components/PageTransition';
import { SkeletonTable } from '../../components/SkeletonLoader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 
  'Out for Delivery', 'Delivered', 'Cancelled', 
  'Return Requested', 'Return Approved', 'Return Rejected', 'Returned', 'Refunded'
];

const FILTER_TABS = [
  'All', 'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 
  'Delivered', 'Returned', 'Cancelled'
];

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null, newStatus: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const initiateStatusChange = (id, status) => {
    setConfirmModal({ isOpen: true, orderId: id, newStatus: status });
  };

  const confirmStatusChange = async () => {
    const { orderId, newStatus } = confirmModal;
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setConfirmModal({ isOpen: false, orderId: null, newStatus: '' });
    }
  };

  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  const columns = [
    { key: '_id', label: 'Order ID', render: (row) => <span className="font-mono text-xs text-gray-500">{(row._id?.toString?.() ?? '').substring(0, 8)}...</span> },
    { key: 'user', label: 'Customer', render: (row) => (
      <div>
        <div className="font-medium text-slate-900 dark:text-white text-sm">{row.user?.name || 'Guest'}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{row.user?.email}</div>
      </div>
    )},
    { key: 'product', label: 'Product', render: (row) => (
      <div className="text-sm text-slate-800 dark:text-slate-200">{row.product?.name || '—'}</div>
    )},
    { key: 'price', label: 'Amount', render: (row) => `$${(row.totalPrice || 0).toFixed(2)}` },
    { key: 'risk', label: 'Return Risk', render: (row) => {
      if (row.isFallback || row.prediction === 'Unavailable') {
        return (
          <span className="px-2 py-0.5 text-xs rounded-full font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Unavailable
          </span>
        );
      }
      const prob = row.probability || 0;
      const isHigh = prob > 50;
      return (
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${isHigh ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
          {prob.toFixed(1)}% {isHigh ? 'High' : 'Low'}
        </span>
      );
    }},
    { key: 'status', label: 'Status', render: (row) => (
      <div className="flex flex-col gap-1 items-start">
        <StatusBadge status={row.status} />
        <select
          value={row.status || 'Pending'}
          onChange={(e) => initiateStatusChange(row._id, e.target.value)}
          className="text-xs px-1 py-1 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-24 cursor-pointer"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    )},
    { key: 'delivery', label: 'Delivery', render: (row) => {
      if (row.status === 'Delivered') {
        const act = row.actualDeliveryDate || row.updatedAt;
        return <span className="text-xs text-green-700 dark:text-green-400 font-medium">{act ? new Date(act).toLocaleDateString() : 'Delivered'}</span>;
      }
      if (row.status === 'Cancelled') {
        return <span className="text-xs text-gray-400">Cancelled</span>;
      }
      if (row.estimatedDelivery) {
        return <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Est: {new Date(row.estimatedDelivery).toLocaleDateString()}</span>;
      }
      return <span className="text-xs text-gray-500">3–7 days</span>;
    }},
    { key: 'actions', label: 'Actions', render: (row) => (
      <button 
        onClick={() => setSelectedOrder(row)}
        className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
      >
        View Detail
      </button>
    )}
  ];

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Orders</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filteredOrders.length} orders shown</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-auto pb-2 flex gap-2">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? <SkeletonTable /> : (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <DataTable columns={columns} data={filteredOrders} exportable exportFilename="orders" pageSize={15} searchKey="user.name" />
          </div>
        )}

      </motion.div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, orderId: null, newStatus: '' })}
        onConfirm={confirmStatusChange}
        title="Update Order Status"
        message={`Are you sure you want to change the status of this order to "${confirmModal.newStatus}"?`}
        confirmText="Update Status"
      />

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-gray-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Order Details</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Order ID: </span>
                    <span className="font-mono text-slate-900 dark:text-white">{selectedOrder._id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Date: </span>
                    <span className="text-slate-900 dark:text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Status: </span>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Payment: </span>
                    <span className="text-slate-900 dark:text-white">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Est. Delivery: </span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {selectedOrder.estimatedDelivery ? new Date(selectedOrder.estimatedDelivery).toLocaleDateString() : '3–7 biz days'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Actual Delivery: </span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {selectedOrder.actualDeliveryDate ? new Date(selectedOrder.actualDeliveryDate).toLocaleDateString() : (selectedOrder.status === 'Delivered' ? 'Delivered' : 'Pending')}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Customer Info</h4>
                  <div className="text-sm">
                    <p className="text-slate-700 dark:text-slate-300"><span className="font-medium">Name:</span> {selectedOrder.user?.name}</p>
                    <p className="text-slate-700 dark:text-slate-300"><span className="font-medium">Email:</span> {selectedOrder.user?.email}</p>
                    {selectedOrder.user?.phone && <p className="text-slate-700 dark:text-slate-300"><span className="font-medium">Phone:</span> {selectedOrder.user?.phone}</p>}
                    {selectedOrder.user?.address && <p className="text-slate-700 dark:text-slate-300"><span className="font-medium">Address:</span> {selectedOrder.user?.address}</p>}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Product Info</h4>
                  <div className="flex gap-4">
                    {selectedOrder.product?.image && (
                      <img src={selectedOrder.product.image} alt="product" className="w-16 h-16 object-cover rounded-md" />
                    )}
                    <div className="text-sm">
                      <p className="text-slate-900 dark:text-white font-medium">{selectedOrder.product?.name}</p>
                      <p className="text-slate-500 dark:text-slate-400">Category: {selectedOrder.product?.category}</p>
                      <p className="text-slate-700 dark:text-slate-300 mt-1">
                        {selectedOrder.quantity} x ${selectedOrder.product?.price} = <span className="font-bold">${selectedOrder.totalPrice}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-800 pt-4">
                  <h4 className="font-semibold text-slate-800 dark:text-white mb-2">AI Return Prediction</h4>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Prediction:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.prediction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Probability:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.probability}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors font-medium">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </PageTransition>
  );
}
