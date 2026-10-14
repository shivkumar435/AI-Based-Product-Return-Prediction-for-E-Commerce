const express = require('express');
const router = express.Router();
const { getDashboardStats, getReports, exportCsv, getHighRiskCustomers, getHighRiskProducts, uploadDataset, upload, getAnalytics, getCustomerAnalytics, getInventory, getModelInfo } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/reports', protect, admin, getReports);
router.get('/export-csv', protect, admin, exportCsv);
router.get('/high-risk-customers', protect, admin, getHighRiskCustomers);
router.get('/high-risk-products', protect, admin, getHighRiskProducts);
router.post('/upload-dataset', protect, admin, upload.single('dataset'), uploadDataset);

router.get('/analytics', protect, admin, getAnalytics);
router.get('/customer-analytics', protect, admin, getCustomerAnalytics);
router.get('/inventory', protect, admin, getInventory);
router.get('/model-info', protect, admin, getModelInfo);

module.exports = router;
