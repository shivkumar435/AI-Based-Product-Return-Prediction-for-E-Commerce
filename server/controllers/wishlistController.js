const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.json({ success: true, message: 'Wishlist retrieved', data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }
    
    const updated = await Wishlist.findById(wishlist._id).populate('products');
    res.json({ success: true, message: 'Product added to wishlist', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found' });
    
    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();
    
    const updated = await Wishlist.findById(wishlist._id).populate('products');
    res.json({ success: true, message: 'Product removed from wishlist', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });
    
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    const isInWishlist = wishlist ? wishlist.products.includes(productId) : false;
    
    res.json({ success: true, data: { inWishlist: isInWishlist } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist
};
