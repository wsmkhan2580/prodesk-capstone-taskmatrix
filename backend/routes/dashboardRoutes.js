const express = require('express');
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');
const Task = require('../models/Task');

const router = express.Router();

// @route   GET /api/dashboard
// @desc    Protected route - returns profile info + task stats for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [total, todo, inProgress, done, assignedToMe] = await Promise.all([
      Task.countDocuments({ authorId: req.user.id }),
      Task.countDocuments({ authorId: req.user.id, status: 'To Do' }),
      Task.countDocuments({ authorId: req.user.id, status: 'In Progress' }),
      Task.countDocuments({ authorId: req.user.id, status: 'Done' }),
      Task.countDocuments({ assignedTo: req.user.id }),
    ]);

    res.json({
      message: 'This is protected dashboard data.',
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: 'Authenticated',
        accountCreated: user.createdAt,
        loginTime: new Date(),
        isPro: user.isPro,
        subscribedAt: user.subscribedAt,
      },
      taskStats: {
        total,
        todo,
        inProgress,
        done,
        assignedToMe,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/dashboard/profile
// @desc    Update the logged-in user's name
router.put('/profile', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated', name: user.name });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
