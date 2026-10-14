import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';
import StatsCard from '../../components/StatsCard';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CustomerAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCustomerAnalytics();
      setData(res);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load customer analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="p-6 text-center dark:text-white">No data available</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Analytics</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Customers" value={data.totalCustomers || 0} icon="users" />
        <StatsCard title="Avg Customer Lifetime Value" value={`$${(data.avgCLV || 0).toFixed(2)}`} icon="currency-dollar" />
        <StatsCard title="Avg Purchase Frequency" value={(data.avgPurchaseFrequency || 0).toFixed(1)} icon="shopping-cart" />
        <StatsCard title="Avg Return Rate" value={`${(data.avgReturnRate || 0).toFixed(1)}%`} icon="arrow-path" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Customer Return Rate Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.returnRateDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="bucket" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Purchase Frequency Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.purchaseFrequencyDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="frequency" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Frequent Return Customers</h3>
          </div>
          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'totalOrders', label: 'Orders' },
              { key: 'returns', label: 'Returns' },
              { key: 'returnRate', label: 'Return Rate (%)', render: (val) => `${val?.toFixed(1)}%` },
              { key: 'totalSpent', label: 'Total Spent', render: (val) => `$${val?.toFixed(2)}` },
            ]}
            data={data.frequentReturners || []}
            searchKey="name"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">High Value Customers</h3>
          </div>
          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'totalOrders', label: 'Orders' },
              { key: 'totalSpent', label: 'Total Spent', render: (val) => `$${val?.toFixed(2)}` },
              { key: 'avgOrderValue', label: 'Avg Order Value', render: (val) => `$${val?.toFixed(2)}` },
            ]}
            data={data.highValueCustomers || []}
            searchKey="name"
          />
        </div>
      </div>
    </div>
  );
}
