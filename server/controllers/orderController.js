const Order = require('../models/Order');
const Product = require('../models/Product');
const Prediction = require('../models/Prediction');
const { calculateDeliveryWindow, addBusinessDays, getDeliveryStatusInfo } = require('../utils/deliveryDate');
const { predictReturn } = require('../services/mlService');

const createOrder = async (req, res) => {
  try {
    const { 
      product: productId, 
      quantity, 
      paymentMethod,
      discount = 0,
      deliveryTime,
      customerRating,
      previousReturns,
      customerAge,
      gender,
      shippingDistance,
      orderFrequency,
      shippingAddress
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    const discountAmount = (discount || 0) / 100;
    const totalPrice = product.price * quantity * (1 - discountAmount);

    // Calculate estimated delivery date: 3-7 business days default (skipping weekends)
    const deliveryDays = deliveryTime ? Math.min(7, Math.max(3, parseInt(deliveryTime, 10))) : 5;
    const estimatedDeliveryDate = addBusinessDays(new Date(), deliveryDays);

    // Features for ML
    const features = {
      Product_Price: product.price,
      Product_Category: product.category,
      Discount: discount,
      Delivery_Time: deliveryDays,
      Customer_Rating: customerRating,
      Previous_Returns: previousReturns,
      Payment_Method: paymentMethod,
      Quantity: quantity,
      Customer_Age: customerAge,
      Gender: gender,
      Shipping_Distance: shippingDistance,
      Order_Frequency: orderFrequency
    };

    let mlPrediction = 'Unavailable';
    let mlProbability = 0;
    let mlConfidence = 0;
    let mlRiskLevel = 'Unknown';
    let mlRiskFactors = [];
    let isFallback = false;
    let fallbackReason = null;

    try {
      const mlResult = await predictReturn(features);
      mlPrediction = mlResult.prediction;
      mlProbability = Number(mlResult.probability);
      mlConfidence = Number(mlResult.confidence);
      mlRiskLevel = mlResult.riskLevel || 'Unknown';
      mlRiskFactors = Array.isArray(mlResult.riskFactors) ? mlResult.riskFactors : [];
    } catch (mlError) {
      console.warn('ML Prediction failed during order creation:', mlError.message);
      isFallback = true;
      fallbackReason = mlError.message;
      mlPrediction = 'Unavailable';
      mlProbability = 0;
      mlConfidence = 0;
      mlRiskLevel = 'Unknown';
      mlRiskFactors = [];
    }

    product.stock -= quantity;
    await product.save();

    const order = new Order({
      user: req.user._id,
      product: productId,
      quantity,
      paymentMethod,
      totalPrice,
      estimatedDelivery: estimatedDeliveryDate,
      shippingAddress: shippingAddress || undefined,
      prediction: mlPrediction,
      probability: mlProbability,
      confidence: mlConfidence,
      riskLevel: mlRiskLevel,
      riskFactors: mlRiskFactors,
      isFallback,
      fallbackReason,
      statusHistory: [{
        status: 'Pending',
        timestamp: new Date(),
        note: `Order placed. Estimated delivery: ${estimatedDeliveryDate.toDateString()} (3–7 business days)`
      }]
    });

    const createdOrder = await order.save();

    // Save prediction record (idempotent by orderId)
    try {
      const predPayload = {
        user: req.user._id,
        inputFeatures: features,
        prediction: mlPrediction,
        confidence: mlConfidence,
        orderId: createdOrder._id,
        probability: mlProbability,
        riskLevel: mlRiskLevel,
        riskFactors: mlRiskFactors,
        featureImportance: [],
        isFallback,
        fallbackReason
      };

      await Prediction.findOneAndUpdate(
        { orderId: createdOrder._id },
        { $set: predPayload },
        { upsert: true, new: true }
      );
      // Also update the Order document with probability and prediction fields for UI convenience
      try {
        // Ensure the Order document is updated in the database with prediction fields
        await Order.findByIdAndUpdate(createdOrder._id, {
          $set: {
            probability: mlProbability,
            confidence: mlConfidence,
            prediction: mlPrediction,
            riskLevel: mlRiskLevel,
            riskFactors: mlRiskFactors,
            isFallback,
            fallbackReason
          }
        }, { new: true });
      } catch (eo) {
        console.error('Failed to update order with prediction:', eo.message);
      }
    } catch (predErr) {
      console.error('Failed to save prediction record:', predErr.message);
    }

    // Fetch fresh order with populated relations to return accurate prediction fields
    try {
      const fresh = await Order.findById(createdOrder._id).populate('product').populate('user', 'name email');
      return res.status(201).json({ success: true, order: fresh });
    } catch (e) {
      return res.status(201).json({ success: true, order: createdOrder });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const total = await Order.countDocuments({ user: req.user._id });

    const orders = await Order.find({ user: req.user._id })
      .populate('product')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const total = await Order.countDocuments({});

    const orders = await Order.find({})
      .populate('user', 'id name email')
      .populate('product')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    res.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalOrders: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, actualDeliveryDate, estimatedDelivery } = req.body;
    const validStatuses = [
      'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 
      'Out for Delivery', 'Delivered', 'Cancelled', 
      'Return Requested', 'Return Approved', 'Return Rejected', 'Returned', 'Refunded'
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const order = await Order.findById(req.params.id).populate('product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    const previousStatus = order.status;
    order.status = status;

    // Delivery date updates
    if (status === 'Delivered') {
      order.actualDeliveryDate = actualDeliveryDate ? new Date(actualDeliveryDate) : (order.actualDeliveryDate || new Date());
    } else if (status === 'Confirmed' && !order.estimatedDelivery) {
      order.estimatedDelivery = addBusinessDays(new Date(), 5);
    }
    if (estimatedDelivery) {
      order.estimatedDelivery = new Date(estimatedDelivery);
    }
    
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || (status === 'Delivered' 
        ? `Order delivered on ${order.actualDeliveryDate.toDateString()}` 
        : `Status updated from ${previousStatus} to ${status}`)
    });

    // Restock if transitioning to Cancelled or Returned from active state
    if (['Cancelled', 'Returned'].includes(status) && !['Cancelled', 'Returned'].includes(previousStatus)) {
      if (order.product) {
        order.product.stock += order.quantity || 1;
        await order.product.save();
      }
    }

    const updated = await order.save();
    const deliveryInfo = getDeliveryStatusInfo(updated);
    res.json({ success: true, order: updated, deliveryInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('product').populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const orderUserId = order.user?._id ? order.user._id.toString() : order.user?.toString();
    if (orderUserId && orderUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const deliveryInfo = getDeliveryStatusInfo(order);
    res.json({ success: true, order, deliveryInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    if (!cancelReason) {
      return res.status(400).json({ success: false, message: 'Cancel reason is required' });
    }
    const order = await Order.findById(req.params.id).populate('product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    if (order.status !== 'Pending' && order.status !== 'Confirmed') {
      return res.status(400).json({ success: false, message: `Cannot cancel order with status ${order.status}` });
    }
    
    order.status = 'Cancelled';
    order.cancelReason = cancelReason;
    
    // Restock
    if (order.product) {
      order.product.stock += order.quantity;
      await order.product.save();
    }
    
    await order.save();
    res.json({ success: true, message: 'Order cancelled', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const requestReturn = async (req, res) => {
  try {
    const { returnReason } = req.body;
    if (!returnReason) {
      return res.status(400).json({ success: false, message: 'Return reason is required' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    if (order.status !== 'Delivered') {
      return res.status(400).json({ success: false, message: `Cannot return order with status ${order.status}` });
    }
    
    order.status = 'Return Requested';
    order.returnReason = returnReason;
    
    await order.save();
    res.json({ success: true, message: 'Return requested', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveReturn = async (req, res) => {
  try {
    const { approved, note } = req.body;
    const order = await Order.findById(req.params.id).populate('product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.status !== 'Return Requested') {
      return res.status(400).json({ success: false, message: `Order status is ${order.status}, not Return Requested` });
    }
    
    if (approved) {
      order.status = 'Returned'; // Or Return Approved
      // Restock
      if (order.product) {
        order.product.stock += order.quantity;
        await order.product.save();
      }
    } else {
      order.status = 'Return Rejected';
    }
    if (note) {
      order.adminNote = note;
    }
    
    await order.save();
    res.json({ success: true, message: `Return ${approved ? 'approved' : 'rejected'}`, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('product').populate('user');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const orderUserId = order.user?._id ? order.user._id.toString() : order.user?.toString();
    if (orderUserId && orderUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    res.json({
      success: true,
      data: {
        orderId: order._id,
        date: order.createdAt,
        status: order.status,
        customer: {
          name: order.user.name,
          email: order.user.email
        },
        items: [{
          productName: order.product ? order.product.name : 'Unknown Product',
          quantity: order.quantity,
          price: order.product ? order.product.price : 0,
          total: order.totalPrice
        }],
        subtotal: order.totalPrice,
        total: order.totalPrice,
        paymentMethod: order.paymentMethod
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  cancelOrder,
  requestReturn,
  approveReturn,
  getInvoice
};
