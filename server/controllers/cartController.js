const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
      cart = await Cart.findById(cart._id).populate('items.product');
    }
    
    // Compute totals using server-side product data only
    let subtotal = 0;
    let discountTotal = 0;
    let totalPrice = 0;
    let totalItems = 0;
    
    cart.items.forEach(item => {
      if (!item.savedForLater && item.product) {
        const price = Number(item.product.price || 0);
        const discountPercent = Number(item.product.discount || 0);
        const itemSubtotal = price * item.quantity;
        const itemDiscount = itemSubtotal * (discountPercent / 100);
        subtotal += itemSubtotal;
        discountTotal += itemDiscount;
        totalPrice += itemSubtotal - itemDiscount;
        totalItems += item.quantity;
      }
    });
    
    res.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: {
        cart,
        subtotal,
        discountTotal,
        totalPrice,
        totalItems
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Number(quantity);
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID is required' });
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }
    
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (!product.isActive) return res.status(400).json({ success: false, message: 'Product is unavailable' });
    if (product.stock < qty) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);
    if (itemIndex > -1) {
      const nextQty = cart.items[itemIndex].quantity + qty;
      if (product.stock < nextQty) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }
      cart.items[itemIndex].quantity = nextQty;
      cart.items[itemIndex].savedForLater = false;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    
    res.status(200).json({ success: true, message: 'Item added to cart', data: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }
    
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });
    
    if (!item.product || !item.product.isActive) return res.status(400).json({ success: false, message: 'Product is unavailable' });
    if (item.product.stock < qty) return res.status(400).json({ success: false, message: 'Insufficient stock' });
    
    item.quantity = qty;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json({ success: true, message: 'Cart updated', data: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json({ success: true, message: 'Item removed', data: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    
    cart.items = [];
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json({ success: true, message: 'Cart cleared', data: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleSaveForLater = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    
    item.savedForLater = !item.savedForLater;
    await cart.save();
    
    res.json({ success: true, message: 'Item status updated', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  toggleSaveForLater
};
