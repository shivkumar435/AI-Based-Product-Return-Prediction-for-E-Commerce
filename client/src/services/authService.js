import api from './api';

const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data?.data ?? res.data;
  },
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data?.data ?? res.data;
  },
  getProfile: async () => {
    // backend exposes /auth/me
    const res = await api.get('/auth/me');
    return res.data?.data ?? res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/users/profile', data);
    return res.data;
  },
  changePassword: async (data) => {
    const res = await api.put('/users/change-password', data);
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (token, password) => {
    const res = await api.post(`/auth/reset-password/${token}`, { password });
    return res.data;
  }
};

export default authService;