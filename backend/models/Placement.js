const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    companyName: { type: String, required: true },
    role: { type: String, required: true },
    package: { type: Number, default: 0 }, // annual CTC
    interviewDate: { type: Date },
    status: {
      type: String,
      enum: ['applied', 'interview_scheduled', 'selected', 'rejected'],
      default: 'applied',
    },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Placement', placementSchema);
