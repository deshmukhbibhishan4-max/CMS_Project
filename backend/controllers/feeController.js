const Fee = require('../models/Fee');

const getFees = async (req, res) => {
  try {
    const fees = await Fee.find()
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('course', 'name fees');
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('course', 'name fees');
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createFee = async (req, res) => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json(fee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/fees/:id/pay  - record a payment
const recordPayment = async (req, res) => {
  try {
    const { amount, method, receiptNo } = req.body;
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });

    fee.payments.push({ amount, method, receiptNo: receiptNo || `RCPT-${Date.now()}` });
    fee.paidAmount += Number(amount);

    if (fee.paidAmount >= fee.totalAmount) {
      fee.status = 'paid';
    } else if (fee.paidAmount > 0) {
      fee.status = 'partial';
    }

    await fee.save();
    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    res.json({ message: 'Fee record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/fees/summary - totals for dashboard
const getFeeSummary = async (req, res) => {
  try {
    const fees = await Fee.find();
    const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalPending = fees.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0);
    res.json({ totalCollected, totalPending, totalRecords: fees.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getFees, getFeeById, createFee, recordPayment, deleteFee, getFeeSummary };
