const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: String, required: true, unique: true },
    subjects: [{ type: String }],
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    qualification: { type: String, default: '' },
    salary: { type: Number, default: 0 },
    joiningDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
