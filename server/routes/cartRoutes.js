const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart, toggleSaveForLater } = require('../controllers/cartController');

router.use(protect); // All cart routes require auth
router.route('/').get(getCart).delete(clearCart);
router.route('/items').post(addToCart);
router.route('/items/:itemId').put(updateCartItem).delete(removeFromCart);
router.route('/items/:itemId/save-for-later').put(toggleSaveForLater);

module.exports = router;
