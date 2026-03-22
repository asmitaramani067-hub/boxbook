const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

// POST /api/notifications/subscribe — save push subscription
router.post('/subscribe', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { pushSubscription: req.body });
    res.json({ message: 'Subscribed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/notifications — get owner's notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ owner: req.user._id })
      .sort('-createdAt')
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ owner: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
