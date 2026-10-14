import api from './api';

const normalizeList = (payload, key) => {
  if (Array.isArray(payload)) return payload.filter(Boolean);
  if (Array.isArray(payload?.[key])) return payload[key].filter(Boolean);
  if (Array.isArray(payload?.data)) return payload.data.filter(Boolean);
  return [];
};

const adminService = {
  getDashboard: async (params) => {
    const res = await api.get('/admin/dashboard', { params });
    return res.data?.data || res.data || {};
  },
  getAnalytics: async (params) => {
    const res = await api.get('/admin/analytics', { params });
    return res.data?.data || res.data;
  },
  getCustomerAnalytics: async () => {
    const res = await api.get('/admin/customer-analytics');
    return res.data?.data || res.data;
  },
  getInventory: async () => {
    const res = await api.get('/admin/inventory');
    return res.data?.data || res.data;
  },
  getReports: async (params) => {
    const res = await api.get('/admin/reports', { params });
    const data = res.data?.data || res.data || {};
    return {
      ...data,
      categoryReturns: normalizeList(data, 'categoryReturns'),
      paymentMethods: normalizeList(data, 'paymentMethods'),
      timeSeriesData: normalizeList(data, 'timeSeriesData'),
      monthlyStats: normalizeList(data, 'monthlyStats')
    };
  },
  getUsers: async () => {
    const res = await api.get('/users');
    return normalizeList(res.data, 'users');
  },
  deleteUser: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data?.message || 'User removed';
  },
  getHighRiskCustomers: async () => {
    const res = await api.get('/admin/high-risk-customers');
    return normalizeList(res.data, 'customers');
  },
  getHighRiskProducts: async () => {
    const res = await api.get('/admin/high-risk-products');
    return normalizeList(res.data, 'products');
  },
  uploadDataset: async (formData) => {
    const res = await api.post('/admin/upload-dataset', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  getModelInfo: async () => {
    const res = await api.get('/admin/model-info');
    return res.data?.data || res.data;
  },
  exportCsv: async (params) => {
    const res = await api.get('/admin/export-csv', {
      params,
      responseType: 'blob'
    });
    return res.data;
  }
};

export default adminService;