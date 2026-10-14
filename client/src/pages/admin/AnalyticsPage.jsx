import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart, PieChart, Pie, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import adminService from '../../services/adminService';
import { SkeletonDashboard } from '../../components/SkeletonLoader';
import PageTransition from '../../components/PageTransition';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f43f5e', '#84cc16'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAnalytics({ startDate, endDate });
      setData(res);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-xl text-white text-sm">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, {minimumFractionDigits: entry.name.toLowerCase().includes('revenue') ? 2 : 0}) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && !data) return <SkeletonDashboard />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Advanced Analytics</h1>
          
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 bg-transparent border-none focus:ring-0 text-sm text-slate-700 dark:text-slate-300"
            />
            <span className="text-gray-400">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 bg-transparent border-none focus:ring-0 text-sm text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>

        {loading && <div className="text-sm text-indigo-500">Updating charts...</div>}

        {/* Actual Return Rate KPI Summary for Date Range */}
        {data?.summary && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm border-l-4 border-l-rose-500">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Actual Return Rate</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{data.summary.actualReturnRate}%</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Completed returns / delivered orders</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Eligible Delivered Orders</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{data.summary.totalDelivered}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Denominator (Excl. cancelled/undelivered)</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm border-l-4 border-l-indigo-500">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Completed Returns</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{data.summary.totalReturns}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Numerator (Status: Returned / Refunded)</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-500">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pending Return Requests</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{data.summary.totalPendingRequests}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Awaiting review (Not completed returns)</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Monthly Revenue AreaChart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Monthly Revenue</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(value) => `$${value/1000}k`} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Monthly Orders vs Returns ComposedChart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Orders vs Returns</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data?.ordersVsReturns || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis yAxisId="left" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{fontSize: '12px'}} />
                  <Bar yAxisId="left" dataKey="orders" name="Total Orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="returns" name="Returns" stroke="#ef4444" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Return Rate Trend LineChart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Return Rate Trend (%)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.returnRateTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis stroke="#94a3b8" tick={{fontSize: 12}} domain={[0, 'dataMax + 10']} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <ReferenceLine y={15} label={{ position: 'top', value: 'Target (15%)', fill: '#10b981', fontSize: 12 }} stroke="#10b981" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="rate" name="Return Rate" stroke="#f59e0b" strokeWidth={3} dot={{r: 3}} activeDot={{r: 5}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Product Category Distribution */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Category Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.categoryDistribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" nameKey="name">
                    {(data?.categoryDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 6. Customer Growth AreaChart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Customer Growth</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.customerGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="customers" name="Total Customers" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 7. Prediction Accuracy Trend */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">AI Prediction Accuracy Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.accuracyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis stroke="#94a3b8" tick={{fontSize: 12}} domain={[60, 100]} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="accuracy" name="Accuracy (%)" stroke="#06b6d4" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 8. Top 10 Selling Products */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Top 10 Selling Products</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data?.topProducts || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                  <XAxis type="number" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" tick={{fontSize: 11}} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="sales" name="Units Sold" fill="#10b981" radius={[0, 4, 4, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 9. Top 10 Returned Products */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Top 10 Returned Products</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data?.topReturnedProducts || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                  <XAxis type="number" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" tick={{fontSize: 11}} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="returns" name="Units Returned" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
