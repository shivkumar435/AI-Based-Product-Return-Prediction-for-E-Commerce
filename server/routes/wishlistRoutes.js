const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getWishlist, addToWishlist, removeFromWishlist, checkWishlist } = require('../controllers/wishlistController');

router.use(protect);
router.route('/').get(getWishlist);
router.route('/check').get(checkWishlist);
router.route('/:productId').post(addToWishlist).delete(removeFromWishlist);

module.exports = router;
