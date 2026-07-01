const express = require('express');
const router = express.Router();
const {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  addResult,
  getExamResults,
  getStudentResults,
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getExams)
  .post(protect, authorize('admin', 'teacher'), createExam);

router
  .route('/:id')
  .put(protect, authorize('admin', 'teacher'), updateExam)
  .delete(protect, authorize('admin'), deleteExam);

router
  .route('/:examId/results')
  .get(protect, getExamResults)
  .post(protect, authorize('admin', 'teacher'), addResult);

router.get('/results/student/:studentId', protect, getStudentResults);

module.exports = router;
