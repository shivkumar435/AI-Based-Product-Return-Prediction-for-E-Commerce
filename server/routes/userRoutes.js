const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, getAllUsers, deleteUser, getDashboardStats, getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/dashboard', protect, getDashboardStats);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.route('/addresses').get(protect, getAddresses).post(protect, addAddress);
router.route('/addresses/:addressId').put(protect, updateAddress).delete(protect, deleteAddress);

router.get('/', protect, admin, getAllUsers);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
