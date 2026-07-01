const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    marksObtained: { type: Number, required: true },
    grade: { type: String, default: '' },
    status: { type: String, enum: ['pass', 'fail'], default: 'pass' },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

resultSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
