const OnlineClass = require('../models/OnlineClass');
const Course = require('../models/Course');
const Batch = require('../models/Batch');

// GET all online classes (admin sees all; teacher sees their own; student sees their batch/course)
const getOnlineClasses = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }
    const classes = await OnlineClass.find(filter)
      .populate('course', 'name')
      .populate('batch', 'name')
      .populate('teacher', 'name email')
      .sort({ scheduledAt: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single online class
const getOnlineClassById = async (req, res) => {
  try {
    const cls = await OnlineClass.findById(req.params.id)
      .populate('course', 'name')
      .populate('batch', 'name')
      .populate('teacher', 'name email');
    if (!cls) return res.status(404).json({ message: 'Online class not found' });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create online class (admin or teacher)
const createOnlineClass = async (req, res) => {
  try {
    const { title, description, course, batch, teacher, meetingLink, platform, scheduledAt, durationMinutes, notes } = req.body;
    const assignedTeacher = req.user.role === 'teacher' ? req.user._id : teacher;

    const cls = await OnlineClass.create({
      title, description, course, batch,
      teacher: assignedTeacher,
      meetingLink, platform, scheduledAt, durationMinutes, notes,
    });
    const populated = await cls.populate(['course', 'batch', 'teacher']);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT update online class
const updateOnlineClass = async (req, res) => {
  try {
    const cls = await OnlineClass.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Online class not found' });

    // Only admin or the assigned teacher can update
    if (req.user.role === 'teacher' && cls.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this class' });
    }

    const fields = ['title', 'description', 'course', 'batch', 'meetingLink', 'platform', 'scheduledAt', 'durationMinutes', 'status', 'recordingLink', 'notes'];
    fields.forEach(f => { if (req.body[f] !== undefined) cls[f] = req.body[f]; });

    const updated = await cls.save();
    await updated.populate(['course', 'batch', 'teacher']);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE online class (admin only)
const deleteOnlineClass = async (req, res) => {
  try {
    const cls = await OnlineClass.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Online class not found' });
    res.json({ message: 'Online class deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET upcoming classes summary for dashboard
const getUpcomingClasses = async (req, res) => {
  try {
    const now = new Date();
    const classes = await OnlineClass.find({ scheduledAt: { $gte: now }, status: { $in: ['scheduled', 'live'] } })
      .populate('course', 'name')
      .populate('teacher', 'name')
      .sort({ scheduledAt: 1 })
      .limit(5);
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getOnlineClasses, getOnlineClassById, createOnlineClass, updateOnlineClass, deleteOnlineClass, getUpcomingClasses };
