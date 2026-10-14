import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { motion } from 'framer-motion';
import PageTransition from '../../components/PageTransition';
import { SkeletonTable } from '../../components/SkeletonLoader';
import DataTable from '../../components/DataTable';
import toast from 'react-hot-toast';

export default function HighRiskPage() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custData, prodData] = await Promise.all([
          adminService.getHighRiskCustomers(),
          adminService.getHighRiskProducts()
        ]);
        setCustomers(Array.isArray(custData) ? custData : []);
        setProducts(Array.isArray(prodData) ? prodData : []);
      } catch (err) {
        toast.error('Failed to load high risk data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const RateBadge = ({ rate }) => (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${rate >= 75 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
      {rate?.toFixed(1)}%
    </span>
  );

  const customerCols = [
    { key: 'name', label: 'Name', render: row => <div className="font-medium text-slate-900 dark:text-white">{row.name}</div> },
    { key: 'email', label: 'Email', render: row => <div className="text-sm text-gray-500 dark:text-gray-400">{row.email}</div> },
    { key: 'totalOrders', label: 'Total Orders', render: row => <span className="font-medium">{row.totalOrders}</span> },
    { key: 'returns', label: 'Predicted Returns', render: row => <span className="text-red-600 dark:text-red-400 font-medium">{row.returns}</span> },
    { key: 'totalSpent', label: 'Total Spent', render: row => `$${(row.totalSpent || 0).toFixed(2)}` },
    { key: 'rate', label: 'Return Rate', render: row => <RateBadge rate={row.returnRate} /> }
  ];

  const productCols = [
    { key: 'name', label: 'Product', render: row => <div className="font-medium text-slate-900 dark:text-white">{row.name}</div> },
    { key: 'category', label: 'Category', render: row => (
      <span className="px-2 py-0.5 text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full">{row.category}</span>
    )},
    { key: 'price', label: 'Price', render: row => `$${(row.price || 0).toFixed(2)}` },
    { key: 'totalOrders', label: 'Total Orders', render: row => <span className="font-medium">{row.totalOrders}</span> },
    { key: 'returns', label: 'Predicted Returns', render: row => <span className="text-red-600 dark:text-red-400 font-medium">{row.returns}</span> },
    { key: 'rate', label: 'Return Rate', render: row => <RateBadge rate={row.returnRate} /> }
  ];

  if (loading) return <SkeletonTable />;

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">High Risk Customers</p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-300">{customers.length}</p>
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">High Risk Products</p>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{products.length}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-red-500 rounded-full inline-block"></span>
          High Risk Customers
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">(Return rate ≥ 50%)</span>
        </h2>
        {customers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-10 text-center text-gray-400">
            No high-risk customers found.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <DataTable columns={customerCols} data={customers} exportable exportFilename="high-risk-customers" />
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-orange-500 rounded-full inline-block"></span>
          High Risk Products
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">(Return rate ≥ 50%)</span>
        </h2>
        {products.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-10 text-center text-gray-400">
            No high-risk products found.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <DataTable columns={productCols} data={products} exportable exportFilename="high-risk-products" />
          </div>
        )}
      </div>
    </motion.div>
    </PageTransition>
  );
}
