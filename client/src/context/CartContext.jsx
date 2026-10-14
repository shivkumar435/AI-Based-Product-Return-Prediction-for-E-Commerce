import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartDiscountTotal, setCartDiscountTotal] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await cartService.getCart();
      // backend returns { cart, totalPrice, totalItems } inside data
      const items = data.items || (data.cart && data.cart.items) || [];
      const totalItems = data.totalItems || (data.cart && items.reduce((s, it) => s + (it.quantity || 0), 0)) || 0;
      const subtotal = Number(data.subtotal || 0);
      const discountTotal = Number(data.discountTotal || 0);
      const totalPrice = Number(data.totalPrice || 0);
      setCart(items);
      setCartCount(totalItems);
      setCartSubtotal(subtotal);
      setCartDiscountTotal(discountTotal);
      setCartTotal(totalPrice);
    } catch (error) {
      toast.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
      setCartCount(0);
      setCartSubtotal(0);
      setCartDiscountTotal(0);
      setCartTotal(0);
    }
  }, [user]);

  const addToCart = async (productIdOrObj, quantity = 1) => {
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }
    try {
      const productId = typeof productIdOrObj === 'object' ? (productIdOrObj._id || productIdOrObj.id) : productIdOrObj;
      await cartService.addToCart(productId, quantity);
      await fetchCart();
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await cartService.updateCartItem(itemId, quantity);
      await fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartService.removeFromCart(itemId);
      await fetchCart();
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      await fetchCart();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const toggleSaveForLater = async (itemId) => {
    try {
      await cartService.toggleSaveForLater(itemId);
      await fetchCart();
      toast.success('Saved for later');
    } catch (error) {
      toast.error('Failed to save for later');
    }
  };

  return (
    <CartContext.Provider value={{
      cart, cartCount, cartSubtotal, cartDiscountTotal, cartTotal, loading,
      fetchCart, addToCart, updateQuantity, removeItem, clearCart, toggleSaveForLater
    }}>
      {children}
    </CartContext.Provider>
  );
};
