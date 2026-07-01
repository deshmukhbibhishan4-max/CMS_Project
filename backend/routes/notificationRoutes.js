const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getNotifications)
  .post(protect, authorize('admin', 'teacher'), createNotification);

router.delete('/:id', protect, authorize('admin'), deleteNotification);

module.exports = router;
