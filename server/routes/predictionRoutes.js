const express = require('express');
const router = express.Router();
const { predict, getUserPredictions, getAllPredictions } = require('../controllers/predictionController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.post('/', protect, predict);
router.get('/', protect, getUserPredictions);
router.get('/all', protect, admin, getAllPredictions);

module.exports = router;
