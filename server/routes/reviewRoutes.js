const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { getProductReviews, createReview, deleteReview, getMyReviews } = require('../controllers/reviewController');

router.get('/my', protect, getMyReviews);
router.get('/me', protect, getMyReviews);
router.route('/product/:productId').get(getProductReviews).post(protect, createReview);
router.route('/:productId').get(getProductReviews).post(protect, createReview);
router.route('/item/:id').delete(protect, deleteReview);
router.route('/:id').delete(protect, deleteReview);

module.exports = router;
