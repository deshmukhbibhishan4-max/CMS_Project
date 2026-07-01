const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceByBatch,
  getStudentAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'teacher'), markAttendance);
router.get('/batch/:batchId', protect, getAttendanceByBatch);
router.get('/student/:studentId', protect, getStudentAttendance);

module.exports = router;
