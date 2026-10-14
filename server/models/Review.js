const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
  helpful: { type: Number, default: 0 }
}, { timestamps: true });

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1 });

// Static method to calculate average rating for a product
reviewSchema.statics.calcAverageRating = async function(productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
  ]);
  try {
    const Product = mongoose.model('Product');
    if (result.length > 0) {
      await Product.findByIdAndUpdate(productId, { rating: Math.round(result[0].avgRating * 10) / 10, numReviews: result[0].numReviews });
    } else {
      await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
    }
  } catch (err) {
    console.error('Error updating product rating:', err);
  }
};

// Recalc on save and remove
reviewSchema.post('save', function() { this.constructor.calcAverageRating(this.product); });
reviewSchema.post('remove', function() { this.constructor.calcAverageRating(this.product); });

module.exports = mongoose.model('Review', reviewSchema);
