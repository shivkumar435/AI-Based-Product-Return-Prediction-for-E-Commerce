import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('Product Report');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    'Product Report',
    'Customer Report',
    'Sales Report',
    'Revenue Report',
    'AI Prediction Report',
    'Return Analysis Report'
  ];

  const [summary, setSummary] = useState(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await adminService.getReports({ type: reportType, startDate, endDate });
      setData(res.reportData || []);
      setSummary(res.summary || null);
      toast.success(`${reportType} generated successfully`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = async () => {
    try {
      const blob = await adminService.exportCsv({ type: reportType, startDate, endDate });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('CSV exported successfully');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const getColumns = () => {
    if (!data || data.length === 0) return [];
    
    // Auto-generate columns based on first item
    return Object.keys(data[0]).map(key => ({
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      render: (val) => {
        if (typeof val === 'number') {
          if (key.toLowerCase().includes('price') || key.toLowerCase().includes('revenue') || key.toLowerCase().includes('spent')) {
            return `$${val.toFixed(2)}`;
          }
          if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('accuracy') || key.toLowerCase().includes('probability')) {
            return `${val.toFixed(1)}%`;
          }
        }
        return val;
      }
    }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {reportTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">Start Date (Optional)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">End Date (Optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      
      {!loading && data && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{reportType} Results</h3>
              {summary && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Actual Return Rate: <span className="font-bold text-rose-600 dark:text-rose-400">{summary.actualReturnRate}%</span> ({summary.returnedOrders} returned / {summary.eligibleDeliveredOrders} eligible delivered orders)
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={handleExportCsv} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                Export CSV
              </button>
              <button onClick={handlePrint} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
                Export PDF (Print)
              </button>
            </div>
          </div>
          <div className="p-6 hidden print:block">
            <h2 className="text-2xl font-bold mb-2">{reportType}</h2>
            <p className="text-gray-500 mb-6">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          <DataTable
            columns={getColumns()}
            data={data}
            searchKey={getColumns()[0]?.key} // Search by first column by default
          />
        </div>
      )}
    </div>
  );
}
