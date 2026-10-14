const Review = require('../models/Review');
const Product = require('../models/Product');

const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const rating = numReviews > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews : 0;
  
  await Product.findByIdAndUpdate(productId, { rating: rating, numReviews: numReviews });
};

const getProductReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const { productId } = req.params;
    const total = await Review.countDocuments({ product: productId });
    
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    res.json({
      success: true,
      message: 'Reviews retrieved',
      data: reviews,
      pagination: {
        page, limit, totalPages: Math.ceil(total / limit), total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment, title } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    const alreadyReviewed = await Review.findOne({ product: productId, user: req.user._id });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You already reviewed this product' });
    }
    
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      title: title || (comment ? (comment.length > 30 ? comment.slice(0, 27) + '...' : comment) : 'Customer Review'),
      comment
    });
    
    await updateProductRating(productId);
    
    res.status(201).json({ success: true, message: 'Review added', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }
    
    const productId = review.product;
    await Review.deleteOne({ _id: review._id });
    
    await updateProductRating(productId);
    
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).populate('product', 'name image price');
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProductReviews,
  createReview,
  deleteReview,
  getMyReviews
};
