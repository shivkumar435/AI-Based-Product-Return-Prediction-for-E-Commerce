import api from './api';

const reviewService = {
  getProductReviews: async (productId, params) => {
    const res = await api.get(`/reviews/product/${productId}`, { params });
    return res.data?.data || res.data?.reviews || res.data || [];
  },
  createReview: async (productId, data) => {
    const res = await api.post(`/reviews/product/${productId}`, data);
    return res.data?.data || res.data?.review || res.data;
  },
  deleteReview: async (reviewId) => {
    const res = await api.delete(`/reviews/${reviewId}`);
    return res.data?.data || res.data;
  },
  getMyReviews: async () => {
    const res = await api.get('/reviews/my');
    return res.data?.data || res.data?.reviews || res.data || [];
  }
};

export default reviewService;
