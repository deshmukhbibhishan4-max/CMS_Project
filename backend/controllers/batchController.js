const Batch = require('../models/Batch');

const getBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('course', 'name code')
      .populate('teacher', 'teacherId')
      .populate('students', 'studentId');
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('course', 'name code')
      .populate('teacher', 'teacherId')
      .populate({ path: 'students', populate: { path: 'user', select: 'name email' } });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createBatch = async (req, res) => {
  try {
    const batch = await Batch.create(req.body);
    res.status(201).json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json({ message: 'Batch deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/batches/:id/students  - assign students to batch
const assignStudents = async (req, res) => {
  try {
    const { studentIds } = req.body; // array of student _ids
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const newIds = studentIds.filter((id) => !batch.students.includes(id));
    batch.students.push(...newIds);
    await batch.save();

    res.json(batch);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getBatches, getBatchById, createBatch, updateBatch, deleteBatch, assignStudents };
