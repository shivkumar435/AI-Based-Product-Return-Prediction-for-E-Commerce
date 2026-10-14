import api from './api';

const cartService = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data?.data || res.data;
  },
  addToCart: async (productId, quantity = 1) => {
    const res = await api.post('/cart/items', { productId, quantity });
    return res.data?.data || res.data;
  },
  updateCartItem: async (itemId, quantity) => {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    return res.data?.data || res.data;
  },
  removeFromCart: async (itemId) => {
    const res = await api.delete(`/cart/items/${itemId}`);
    return res.data?.data || res.data;
  },
  clearCart: async () => {
    const res = await api.delete('/cart');
    return res.data?.data || res.data;
  },
  toggleSaveForLater: async (itemId) => {
    const res = await api.put(`/cart/items/${itemId}/save-for-later`);
    return res.data?.data || res.data;
  }
};
export default cartService;
