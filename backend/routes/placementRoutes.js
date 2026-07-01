const express = require('express');
const router = express.Router();
const {
  getPlacements,
  createPlacement,
  updatePlacement,
  deletePlacement,
  getPlacementStats,
} = require('../controllers/placementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, getPlacementStats);

router
  .route('/')
  .get(protect, getPlacements)
  .post(protect, authorize('admin'), createPlacement);

router
  .route('/:id')
  .put(protect, authorize('admin'), updatePlacement)
  .delete(protect, authorize('admin'), deletePlacement);

module.exports = router;
