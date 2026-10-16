const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  inputFeatures: {
    type: Object,
    required: true
  },
  prediction: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  probability: {
    type: Number
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Unknown'],
    default: 'Unknown'
  },
  isFallback: {
    type: Boolean,
    default: false
  },
  fallbackReason: {
    type: String
  },
  riskFactors: [{
    feature: String,
    reason: String,
    impact: String,
    contribution: Number
  }],
  featureImportance: [{
    feature: String,
    importance: Number
  }],
  recommendation: {
    type: String
  },
  actualOutcome: {
    type: String,
    enum: ['Kept', 'Returned', 'Unknown'],
    default: 'Unknown'
  }
}, {
  timestamps: true
});

predictionSchema.index({ user: 1 });

module.exports = mongoose.model('Prediction', predictionSchema);
