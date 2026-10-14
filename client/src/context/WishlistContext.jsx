import React, { createContext, useContext, useState, useEffect } from 'react';
import wishlistService from '../services/wishlistService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistSet, setWishlistSet] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      // service returns an array of product objects (populated)
      const products = Array.isArray(data) ? data : [];
      setWishlist(products);
      setWishlistSet(new Set(products.map(p => (p._id || p.id).toString())));
    } catch (error) {
      toast.error('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setWishlistSet(new Set());
    }
  }, [user]);

  const addToWishlist = async (productId) => {
    if (!user) {
      toast.error('Please login to manage wishlist');
      return;
    }
    try {
      const products = await wishlistService.addToWishlist(productId);
      const prods = Array.isArray(products) ? products : [];
      setWishlist(prods);
      setWishlistSet(new Set(prods.map(p => (p._id || p.id).toString())));
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const products = await wishlistService.removeFromWishlist(productId);
      const prods = Array.isArray(products) ? products : [];
      setWishlist(prods);
      setWishlistSet(new Set(prods.map(p => (p._id || p.id).toString())));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId) => {
    return wishlistSet.has((productId || '').toString());
  };

  return (
    <WishlistContext.Provider value={{
      wishlist, loading, fetchWishlist, addToWishlist, removeFromWishlist, isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
