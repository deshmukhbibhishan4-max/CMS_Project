const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getOnlineClasses,
  getOnlineClassById,
  createOnlineClass,
  updateOnlineClass,
  deleteOnlineClass,
  getUpcomingClasses,
} = require('../controllers/onlineClassController');

router.get('/upcoming', protect, getUpcomingClasses);
router.route('/')
  .get(protect, getOnlineClasses)
  .post(protect, authorize('admin', 'teacher'), createOnlineClass);

router.route('/:id')
  .get(protect, getOnlineClassById)
  .put(protect, authorize('admin', 'teacher'), updateOnlineClass)
  .delete(protect, authorize('admin'), deleteOnlineClass);

module.exports = router;
