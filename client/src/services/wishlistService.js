import api from './api';

const wishlistService = {
  getWishlist: async () => {
    const res = await api.get('/wishlist');
    // backend returns { success, message, data: wishlist } where wishlist.products is populated
    return res.data?.data?.products || [];
  },
  addToWishlist: async (productId) => {
    const res = await api.post(`/wishlist/${productId}`);
    return res.data?.data?.products || [];
  },
  removeFromWishlist: async (productId) => {
    const res = await api.delete(`/wishlist/${productId}`);
    return res.data?.data?.products || [];
  },
  checkWishlist: async (productId) => {
    const res = await api.get(`/wishlist/check`, { params: { productId } });
    return res.data?.data || { inWishlist: false };
  }
};
export default wishlistService;
