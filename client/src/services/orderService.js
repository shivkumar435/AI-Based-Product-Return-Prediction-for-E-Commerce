import api from './api';

const normalizeList = (payload, key) => {
  if (Array.isArray(payload)) return payload.filter(Boolean);
  if (Array.isArray(payload?.[key])) return payload[key].filter(Boolean);
  if (Array.isArray(payload?.data)) return payload.data.filter(Boolean);
  return [];
};

const orderService = {
  createOrder: async (data) => {
    const res = await api.post('/orders', data);
    return res.data?.order || res.data;
  },
  getOrders: async () => {
    const res = await api.get('/orders');
    return normalizeList(res.data, 'orders');
  },
  getAllOrders: async () => {
    const res = await api.get('/orders/all');
    return normalizeList(res.data, 'orders');
  },
  updateOrderStatus: async (id, status) => {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data?.order || res.data;
  },
  getOrder: async (id) => {
    const res = await api.get(`/orders/${id}`);
    // Normalize possible response shapes: { success:true, order } or { success:true, data: order }
    return res.data?.order ?? res.data?.data ?? res.data;
  },
  cancelOrder: async (id, reason) => {
    const res = await api.post(`/orders/${id}/cancel`, { cancelReason: reason });
    return res.data;
  },
  requestReturn: async (id, reason) => {
    const res = await api.post(`/orders/${id}/return`, { returnReason: reason });
    return res.data;
  },
  getInvoice: async (id) => {
    const res = await api.get(`/orders/${id}/invoice`);
    return res.data?.data || res.data;
  }
};

export default orderService;
