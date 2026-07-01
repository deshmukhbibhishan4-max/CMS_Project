const express = require('express');
const router = express.Router();
const {
  getFees,
  getFeeById,
  createFee,
  recordPayment,
  deleteFee,
  getFeeSummary,
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/summary', protect, authorize('admin'), getFeeSummary);

router
  .route('/')
  .get(protect, authorize('admin'), getFees)
  .post(protect, authorize('admin'), createFee);

router
  .route('/:id')
  .get(protect, getFeeById)
  .delete(protect, authorize('admin'), deleteFee);

router.post('/:id/pay', protect, authorize('admin'), recordPayment);

module.exports = router;
