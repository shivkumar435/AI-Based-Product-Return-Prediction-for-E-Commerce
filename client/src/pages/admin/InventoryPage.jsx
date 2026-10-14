import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';
import StatsCard from '../../components/StatsCard';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function InventoryPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getInventory();
      setData(res);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="p-6 text-center dark:text-white">No data available</div>;

  const renderStatusBadge = (stock, threshold = 10) => {
    if (stock === 0) return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">Out of Stock</span>;
    if (stock <= threshold) return <span className="px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">Low Stock</span>;
    return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">In Stock</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory Management</h1>
      
      {/* Critical Alerts */}
      {data.criticalStock?.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Critical Stock Alerts</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <ul className="list-disc pl-5 space-y-1">
                  {data.criticalStock.map(item => (
                    <li key={item._id}>{item.name} - Only {item.stock} left</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Products" value={data.totalProducts || 0} icon="cube" />
        <StatsCard title="Total Inventory Value" value={`$${(data.totalValue || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon="currency-dollar" />
        <StatsCard title="Low Stock Alerts" value={data.lowStockCount || 0} icon="exclamation-triangle" trend={{ value: data.lowStockCount > 10 ? 'High' : 'Normal', isPositive: data.lowStockCount <= 10 }} />
        <StatsCard title="Out of Stock" value={data.outOfStockCount || 0} icon="x-circle" trend={{ value: 'Critical', isPositive: data.outOfStockCount === 0 }} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Value by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.valueByCategory || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="_id"
                >
                  {(data.valueByCategory || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">All Products Inventory</h3>
          </div>
          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'category', label: 'Category' },
              { key: 'price', label: 'Price', render: (val) => `$${val?.toFixed(2)}` },
              { key: 'stock', label: 'Stock' },
              { key: 'inventoryValue', label: 'Total Value', render: (val, row) => `$${(row.price * row.stock).toLocaleString(undefined, {minimumFractionDigits: 2})}` },
              { key: 'status', label: 'Status', render: (_, row) => renderStatusBadge(row.stock) },
            ]}
            data={data.allProducts || []}
            searchKey="name"
          />
        </div>
      </div>
    </div>
  );
}
