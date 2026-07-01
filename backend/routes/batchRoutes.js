const express = require('express');
const router = express.Router();
const {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  assignStudents,
} = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getBatches)
  .post(protect, authorize('admin'), createBatch);

router
  .route('/:id')
  .get(protect, getBatchById)
  .put(protect, authorize('admin'), updateBatch)
  .delete(protect, authorize('admin'), deleteBatch);

router.post('/:id/students', protect, authorize('admin'), assignStudents);

module.exports = router;
