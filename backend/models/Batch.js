const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    startDate: { type: Date },
    endDate: { type: Date },
    schedule: { type: String, default: '' }, // e.g. "Mon-Fri 10AM-12PM"
    status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Batch', batchSchema);
