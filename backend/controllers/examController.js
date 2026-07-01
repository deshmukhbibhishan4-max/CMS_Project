const Exam = require('../models/Exam');
const Result = require('../models/Result');

const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate('course', 'name').populate('batch', 'name');
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createExam = async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

// @route POST /api/exams/:examId/results  - add/update marks for a student
const addResult = async (req, res) => {
  try {
    const { student, marksObtained, remarks } = req.body;
    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const percentage = (marksObtained / exam.totalMarks) * 100;
    const grade = calculateGrade(percentage);
    const status = marksObtained >= exam.passingMarks ? 'pass' : 'fail';

    let result = await Result.findOne({ exam: exam._id, student });
    if (result) {
      result.marksObtained = marksObtained;
      result.grade = grade;
      result.status = status;
      result.remarks = remarks || result.remarks;
      await result.save();
    } else {
      result = await Result.create({ exam: exam._id, student, marksObtained, grade, status, remarks });
    }

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/exams/:examId/results  - rank list for an exam
const getExamResults = async (req, res) => {
  try {
    const results = await Result.find({ exam: req.params.examId })
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .sort({ marksObtained: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/results/student/:studentId  - performance report for one student
const getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.params.studentId }).populate({
      path: 'exam',
      populate: { path: 'course', select: 'name' },
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  addResult,
  getExamResults,
  getStudentResults,
};
