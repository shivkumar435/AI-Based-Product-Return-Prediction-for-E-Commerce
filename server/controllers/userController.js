const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ success: false, message: 'Email already in use' });
        }
      }
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      const updatedUser = await user.save();
      res.json({
        success: true,
        data: {
          _id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const total = await User.countDocuments({});

    const users = await User.find({})
      .select('-password')
      .skip((page - 1) * limit)
      .limit(limit);
      
    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ success: true, message: 'User removed' });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const Order = require('../models/Order');
const Prediction = require('../models/Prediction');

const getDashboardStats = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const returns = orders.filter(o => ['Return Requested', 'Return Approved', 'Returned'].includes(o.status));
    const totalReturns = returns.length;
    const returnRate = totalOrders > 0 ? ((totalReturns / totalOrders) * 100).toFixed(1) : 0;
    
    const pendingOrders = orders.filter(o => ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery'].includes(o.status)).length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    
    const recentOrders = orders.slice(0, 5);
    
    const predictions = await Prediction.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(5);
    const allPredictions = await Prediction.find({ user: req.user.id });
    const highRiskCount = allPredictions.filter(p => p.riskLevel === 'High').length;
    const lowRiskCount = allPredictions.filter(p => p.riskLevel === 'Low').length;

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSpent,
        totalReturns,
        returnRate,
        pendingOrders,
        deliveredOrders,
        recentOrders,
        predictionHistory: predictions,
        highRiskCount,
        lowRiskCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user.addresses || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const mongoose = require('mongoose');
const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const newAddress = { id: new mongoose.Types.ObjectId().toString(), ...req.body };
    if (!user.addresses) user.addresses = [];
    user.addresses.push(newAddress);
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const index = user.addresses.findIndex(a => a.id === req.params.addressId);
    if (index === -1) return res.status(404).json({ success: false, message: 'Address not found' });
    
    user.addresses[index] = { ...user.addresses[index], ...req.body, id: user.addresses[index].id };
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(a => a.id !== req.params.addressId);
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getProfile, updateProfile, changePassword, getAllUsers, deleteUser,
  getDashboardStats, getAddresses, addAddress, updateAddress, deleteAddress
};
