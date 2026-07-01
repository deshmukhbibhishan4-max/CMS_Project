const Student = require('../models/Student');
const User = require('../models/User');

// @route GET /api/students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('user', 'name email profilePicture isActive')
      .populate('course', 'name code')
      .populate('batch', 'name');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email profilePicture isActive')
      .populate('course', 'name code fees')
      .populate('batch', 'name schedule');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/students  (admin creates user + student profile together)
const createStudent = async (req, res) => {
  try {
    const { name, email, password, course, batch, phone, address, dateOfBirth, guardianName, guardianPhone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password: password || 'student123', role: 'student' });

    const count = await Student.countDocuments();
    const student = await Student.create({
      user: user._id,
      studentId: `STU${String(count + 1).padStart(4, '0')}`,
      course,
      batch,
      phone,
      address,
      dateOfBirth,
      guardianName,
      guardianPhone,
    });

    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const fields = ['course', 'batch', 'phone', 'address', 'dateOfBirth', 'guardianName', 'guardianPhone', 'status'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) student[f] = req.body[f];
    });

    const updated = await student.save();

    if (req.body.name || req.body.email) {
      await User.findByIdAndUpdate(student.user, {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.email && { email: req.body.email }),
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    await User.findByIdAndDelete(student.user);
    await student.deleteOne();

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };
