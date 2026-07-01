const Attendance = require('../models/Attendance');

// @route POST /api/attendance  - mark attendance for a batch on a date
const markAttendance = async (req, res) => {
  try {
    const { batch, date, records } = req.body;

    let attendance = await Attendance.findOne({ batch, date });
    if (attendance) {
      attendance.records = records;
      attendance.markedBy = req.body.markedBy || attendance.markedBy;
      await attendance.save();
    } else {
      attendance = await Attendance.create({ batch, date, records, markedBy: req.body.markedBy });
    }

    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/attendance/batch/:batchId
const getAttendanceByBatch = async (req, res) => {
  try {
    const attendance = await Attendance.find({ batch: req.params.batchId })
      .populate('records.student', 'studentId')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/attendance/student/:studentId  - attendance % for one student
const getStudentAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ 'records.student': req.params.studentId });

    let present = 0;
    let total = 0;
    const history = [];

    records.forEach((att) => {
      const rec = att.records.find((r) => r.student.toString() === req.params.studentId);
      if (rec) {
        total += 1;
        if (rec.status === 'present') present += 1;
        history.push({ date: att.date, status: rec.status });
      }
    });

    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : '0.00';

    res.json({ totalClasses: total, present, percentage, history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { markAttendance, getAttendanceByBatch, getStudentAttendance };
