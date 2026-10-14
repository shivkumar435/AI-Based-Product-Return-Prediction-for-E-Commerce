import os

content = """import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import orderService from '../services/orderService';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import { SkeletonDashboard } from '../components/SkeletonLoader';
import PageTransition from '../components/PageTransition';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data || []);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SkeletonDashboard />
      </div>
    </PageTransition>
  );

  const highRisk = orders.filter(o => (o.probability || 0) > 50);
  const lowRisk = orders.filter(o => (o.probability || 0) <= 50);
  
  // Prediction summary calculations
  const totalPredictions = orders.length;
  const returnRate = totalPredictions > 0 ? ((highRisk.length / totalPredictions) * 100).toFixed(1) : 0;

  const columns = [
    { key: '_id', label: 'Order ID', render: (row) => <span className="font-mono text-xs text-gray-500">{row._id.substring(0, 8)}...</span> },
    { key: 'productName', label: 'Product', render: (row) => <span className="font-medium text-slate-900 dark:text-white">{row.product?.name || 'Manual Entry'}</span> },
    { key: 'totalPrice', label: 'Amount', render: (row) => `$${(row.totalPrice || 0).toFixed(2)}` },
    { key: 'prediction', label: 'Return Risk', render: (row) => {
      const prob = row.probability || 0;
      const isHigh = prob > 50;
      return (
        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${isHigh ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
          {prob.toFixed(1)}% — {isHigh ? 'High Risk' : 'Low Risk'}
        </span>
      );
    }},
    { key: 'status', label: 'Status', render: (row) => (
      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        {row.status || 'Pending'}
      </span>
    )},
    { key: 'date', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() }
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name}!</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your return prediction overview.</p>
          </div>
          <Link to="/order" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm text-sm">
            New Prediction
          </Link>
        </div>

        {/* Prediction Summary Mini-section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-6"
        >
          <div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Prediction Summary</p>
          </div>
          <div className="flex-1 flex gap-8">
            <div>
              <p className="text-2xl font-bold text-indigo-900 dark:text-white">{totalPredictions}</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-300">Total Predictions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-900 dark:text-white">{returnRate}%</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-300">Predicted Return Rate</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: "Total Orders", value: orders.length, color: "indigo", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
            { title: "High Risk Orders", value: highRisk.length, color: "red", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
            { title: "Low Risk Orders", value: lowRisk.length, color: "green", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
            <Link to="/orders" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">View all →</Link>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No orders yet.</p>
              <Link to="/products" className="mt-3 inline-block text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">Browse Products →</Link>
            </div>
          ) : (
            <DataTable columns={columns} data={orders.slice(0, 5)} />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
"""
with open('src/pages/DashboardPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated DashboardPage.jsx")
