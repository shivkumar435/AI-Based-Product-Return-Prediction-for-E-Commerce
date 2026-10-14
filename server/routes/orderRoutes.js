const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getAllOrders, updateOrderStatus, cancelOrder, requestReturn, approveReturn, getInvoice } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);
router.get('/:id', protect, require('../controllers/orderController').getOrderById);
router.get('/all', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.post('/:id/cancel', protect, cancelOrder);
router.post('/:id/return', protect, requestReturn);
router.put('/:id/return/approve', protect, admin, approveReturn);
router.get('/:id/invoice', protect, getInvoice);

module.exports = router;
