const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

// @route   POST /api/projects
// @desc    Create a new project. Creator is automatically the owner and first member.
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description || '',
      ownerId: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/projects
// @desc    Get all projects the logged-in user is a member of
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/projects/:id/members
// @desc    Get the list of members for a project (used to populate the "Assign to" dropdown)
router.get('/:id/members', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (!project.members.some((m) => m._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Forbidden: not a member of this project' });
    }
    res.json(project.members);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add a member to the project by email. Only the owner can add members.
router.post('/:id/members', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can add members' });
    }

    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email' });
    }
    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push(user._id);
    await project.save();
    const updated = await project.populate('members', 'name email');
    res.json(updated.members);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
