const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { audience: { $in: ['all', `${req.user.role}s`] } };
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotifications, createNotification, deleteNotification };
