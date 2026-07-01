const Teacher = require('../models/Teacher');
const User = require('../models/User');

const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('user', 'name email profilePicture isActive');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('user', 'name email profilePicture isActive');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createTeacher = async (req, res) => {
  try {
    const { name, email, password, subjects, phone, address, qualification, salary } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password: password || 'teacher123', role: 'teacher' });

    const count = await Teacher.countDocuments();
    const teacher = await Teacher.create({
      user: user._id,
      teacherId: `TCH${String(count + 1).padStart(4, '0')}`,
      subjects: subjects || [],
      phone,
      address,
      qualification,
      salary,
    });

    res.status(201).json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const fields = ['subjects', 'phone', 'address', 'qualification', 'salary', 'status'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) teacher[f] = req.body[f];
    });

    const updated = await teacher.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    await User.findByIdAndDelete(teacher.user);
    await teacher.deleteOne();

    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher };
