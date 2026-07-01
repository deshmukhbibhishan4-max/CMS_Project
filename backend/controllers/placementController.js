const Placement = require('../models/Placement');

const getPlacements = async (req, res) => {
  try {
    const placements = await Placement.find().populate({
      path: 'student',
      populate: { path: 'user', select: 'name email' },
    });
    res.json(placements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPlacement = async (req, res) => {
  try {
    const placement = await Placement.create(req.body);
    res.status(201).json(placement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePlacement = async (req, res) => {
  try {
    const placement = await Placement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!placement) return res.status(404).json({ message: 'Placement record not found' });
    res.json(placement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePlacement = async (req, res) => {
  try {
    const placement = await Placement.findByIdAndDelete(req.params.id);
    if (!placement) return res.status(404).json({ message: 'Placement record not found' });
    res.json({ message: 'Placement record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/placements/stats
const getPlacementStats = async (req, res) => {
  try {
    const placements = await Placement.find();
    const selected = placements.filter((p) => p.status === 'selected');
    const avgPackage = selected.length
      ? (selected.reduce((sum, p) => sum + p.package, 0) / selected.length).toFixed(2)
      : 0;
    const highestPackage = selected.length ? Math.max(...selected.map((p) => p.package)) : 0;

    res.json({
      totalApplied: placements.length,
      totalSelected: selected.length,
      avgPackage,
      highestPackage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPlacements, createPlacement, updatePlacement, deletePlacement, getPlacementStats };
