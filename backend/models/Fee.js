const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: Date },
    status: { type: String, enum: ['paid', 'pending', 'partial', 'overdue'], default: 'pending' },
    payments: [
      {
        amount: Number,
        date: { type: Date, default: Date.now },
        method: { type: String, enum: ['cash', 'card', 'online', 'upi'], default: 'cash' },
        receiptNo: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fee', feeSchema);
