const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: String,
  prediction: { type: String, default: 'Unknown' },
  probability: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Unknown'], default: 'Unknown' }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: String
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, unique: true },
  
  // Support both single-product (backward compat) and multi-item
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  items: [orderItemSchema],
  
  quantity: { type: Number, default: 1 },
  
  // Pricing
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  
  // Payment
  paymentMethod: { type: String, required: true, enum: ['Credit Card', 'Debit Card', 'PayPal', 'UPI', 'Cash on Delivery', 'Net Banking'] },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  transactionId: String,
  
  // Shipping
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: { type: String, default: 'India' }
  },
  
  // Tracking & Delivery
  trackingNumber: String,
  carrier: String,
  estimatedDelivery: Date,
  actualDeliveryDate: Date,
  
  // ML Prediction (for backward compat with single-product orders)
  prediction: { type: String, default: 'Unknown' },
  probability: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  isFallback: { type: Boolean, default: false },
  fallbackReason: { type: String, default: null },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Unknown'], default: 'Unknown' },
  riskFactors: [{
    feature: String,
    reason: String,
    impact: String,
    contribution: Number
  }],
  
  // Status
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Return Approved', 'Return Rejected', 'Returned', 'Refunded'],
    default: 'Pending'
  },
  statusHistory: [statusHistorySchema],
  
  // Cancel/Return
  cancelReason: String,
  returnReason: String,
  returnImages: [String],
  
  // Invoice
  invoiceNumber: String,
  
  // Notes
  notes: String
}, { timestamps: true });

// Generate order number before save
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = 'ORD-' + String(count + 1001).padStart(6, '0');
  }
  if (!this.invoiceNumber) {
    this.invoiceNumber = 'INV-' + this.orderNumber.replace('ORD-', '');
  }
  next();
});

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
