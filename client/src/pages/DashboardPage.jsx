import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../context/WishlistContext';
import orderService from '../services/orderService';
import productService from '../services/productService';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import ProductCard from '../components/ProductCard';
import { SkeletonDashboard } from '../components/SkeletonLoader';
import PageTransition from '../components/PageTransition';
import PredictionGauge from '../components/PredictionGauge';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, returnRate: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const ordersData = await orderService.getOrders();
        const orders = Array.isArray(ordersData) ? ordersData : [];
        
        // Derive stats
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const pendingOrders = orders.filter(o => o.status === 'Pending').length;
        
        const returnedOrders = orders.filter(o => o.status === 'Returned').length;
        const returnRate = totalOrders > 0 ? ((returnedOrders / totalOrders) * 100).toFixed(1) : 0;
        
        setStats({ totalOrders, totalSpent, returnRate, pendingOrders });
        setRecentOrders(orders.slice(0, 5));
        
        // Predictions (just take orders with prob)
        const preds = orders.filter(o => o.probability !== undefined).slice(0, 5);
        setPredictions(preds);

        // Calculate real order counts by month from user order history
        const monthlyCounts = {};
        orders.forEach(o => {
          if (o.createdAt) {
            const m = new Date(o.createdAt).toLocaleString('default', { month: 'short' });
            monthlyCounts[m] = (monthlyCounts[m] || 0) + 1;
          }
        });
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIdx = new Date().getMonth();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const mIdx = (currentMonthIdx - i + 12) % 12;
          const name = monthNames[mIdx];
          last6Months.push({ name, orders: monthlyCounts[name] || 0 });
        }
        setChartData(last6Months);

        // Recommendations
        const recs = await productService.getProducts({ limit: 4 });
        setRecommendations(Array.isArray(recs) ? recs.filter(Boolean) : []);
        
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonDashboard />
        </div>
      </PageTransition>
    );
  }

  const columns = [
    { key: '_id', label: 'Order ID', render: (row) => <span className="font-mono text-xs text-gray-500">{(row._id?.toString?.() ?? '').substring(0, 8).toUpperCase()}</span> },
    { key: 'productName', label: 'Product', render: (row) => <span className="font-medium text-slate-900 dark:text-white line-clamp-1">{row.product?.name || 'Manual Entry'}</span> },
    { key: 'totalPrice', label: 'Amount', render: (row) => `$${(row.totalPrice || 0).toFixed(2)}` },
    { key: 'status', label: 'Status', render: (row) => (
      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${row.status === 'Delivered' ? 'bg-green-100 text-green-700' : row.status === 'Returned' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
        {row.status || 'Pending'}
      </span>
    )},
    { key: 'date', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() }
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name}!</p>
          </div>
          <Link to="/products" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm text-sm">
            Shop Now
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Orders" value={stats.totalOrders} color="indigo" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} />
          <StatsCard title="Total Spent" value={`$${stats.totalSpent.toFixed(2)}`} color="green" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatsCard title="Return Rate" value={`${stats.returnRate}%`} color="red" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
          <StatsCard title="Pending Orders" value={stats.pendingOrders} color="amber" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Order History (Last 6 Months)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip cursor={{stroke: '#e2e8f0', strokeWidth: 2}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="orders" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Orders</h2>
                <Link to="/orders" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View All</Link>
              </div>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No recent orders.</p>
              ) : (
                <DataTable columns={columns} data={recentOrders} onRowClick={(row) => navigate(`/orders/${row._id}`)} />
              )}
            </div>

            {/* Product Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recommended for You</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {recommendations.map(product => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
            
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            
            {/* Wishlist Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Wishlist</h2>
                <Link to="/wishlist" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View All</Link>
              </div>
              {(!wishlist || wishlist.length === 0) ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">Your wishlist is empty.</p>
              ) : (
                <div className="space-y-4">
                  {wishlist.slice(0, 4).map((item) => {
                    const product = item?.product || item;
                    const productId = product?._id || product?.id;
                    if (!productId) return null;

                    return (
                    <div key={productId} className="flex gap-3 items-center group">
                      <Link to={`/products/${productId}`} className="w-14 h-14 rounded-lg bg-gray-50 dark:bg-slate-800 overflow-hidden border border-gray-100 dark:border-slate-700 flex-shrink-0">
                        {product?.image && <img src={product.image} className="w-full h-full object-cover" alt="" />}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${productId}`}>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{product?.name || 'Unnamed product'}</h3>
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">${Number(product?.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Prediction History */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Return Predictions</h2>
              {predictions.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No predictions yet.</p>
              ) : (
                <div className="space-y-6">
                  {predictions.map(pred => {
                    const prob = pred.probability || 0;
                    return (
                      <div key={pred._id} className="flex gap-4 items-center">
                        <div className="w-12 h-12 flex-shrink-0">
                          {/* Mini Gauge using simple circular progress */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-gray-200 dark:text-slate-700" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className={prob > 70 ? 'text-red-500' : prob > 40 ? 'text-amber-500' : 'text-green-500'} strokeDasharray={`${prob}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="currentColor" strokeWidth="4" fill="none" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{pred.product?.name || `Order ${(pred._id?.toString?.() ?? '').substring(0,6)}`}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{prob.toFixed(1)}% Risk • {new Date(pred.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
