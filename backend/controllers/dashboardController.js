const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const Fee = require('../models/Fee');
const Exam = require('../models/Exam');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const OnlineClass = require('../models/OnlineClass');

// @route GET /api/dashboard/summary
const getDashboardSummary = async (req, res) => {
  try {
    const [totalStudents, totalTeachers, totalCourses, totalBatches, totalOnlineClasses] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Course.countDocuments(),
      Batch.countDocuments(),
      OnlineClass.countDocuments(),
    ]);

    const fees = await Fee.find();
    const feeCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const feePending = fees.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0);

    const upcomingExams = await Exam.find({ examDate: { $gte: new Date() } })
      .sort({ examDate: 1 })
      .limit(5)
      .populate('course', 'name');

    const upcomingOnlineClasses = await OnlineClass.find({
      scheduledAt: { $gte: new Date() },
      status: { $in: ['scheduled', 'live'] },
    })
      .sort({ scheduledAt: 1 })
      .limit(5)
      .populate('course', 'name')
      .populate('teacher', 'name');

    const recentAttendance = await Attendance.find().sort({ date: -1 }).limit(1);
    let todayAttendancePct = 'N/A';
    if (recentAttendance.length) {
      const rec = recentAttendance[0];
      const present = rec.records.filter((r) => r.status === 'present').length;
      todayAttendancePct = rec.records.length ? ((present / rec.records.length) * 100).toFixed(1) : '0';
    }

    const liveClassesCount = await OnlineClass.countDocuments({ status: 'live' });
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalStudents,
      totalTeachers,
      totalCourses,
      totalBatches,
      totalOnlineClasses,
      liveClassesCount,
      feeCollected,
      feePending,
      upcomingExams,
      upcomingOnlineClasses,
      todayAttendancePct,
      notifications,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboardSummary };
