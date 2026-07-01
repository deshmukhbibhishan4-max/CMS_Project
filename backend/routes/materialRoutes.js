const express = require('express');
const router = express.Router();
const { getMaterials, uploadMaterial, deleteMaterial } = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .get(protect, getMaterials)
  .post(protect, authorize('admin', 'teacher'), upload.single('file'), uploadMaterial);

router.delete('/:id', protect, authorize('admin', 'teacher'), deleteMaterial);

module.exports = router;
