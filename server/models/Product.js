const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Shoes', 'Home & Kitchen', 'Beauty', 'Sports', 'Books']
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  description: {
    type: String
  },
  brand: { 
    type: String, 
    default: 'Generic' 
  },
  discount: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 100 
  },
  rating: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5 
  },
  numReviews: { 
    type: Number, 
    default: 0 
  },
  images: [{ 
    type: String 
  }],
  specifications: [{ 
    key: String, 
    value: String 
  }],
  tags: [{ 
    type: String 
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lowStockThreshold: { 
    type: Number, 
    default: 10 
  },
  sku: { 
    type: String 
  }
}, {
  timestamps: true
});

productSchema.index({ name: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
