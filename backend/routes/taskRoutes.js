const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const protect = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

// Helper: confirm the logged-in user is a member of the given project
async function assertMembership(projectId, userId) {
  const project = await Project.findById(projectId);
  if (!project) return { ok: false, code: 404, message: 'Project not found' };
  if (!project.members.map((m) => m.toString()).includes(userId)) {
    return { ok: false, code: 403, message: 'Forbidden: not a member of this project' };
  }
  return { ok: true, project };
}

// @route   POST /api/tasks
// @desc    Create a task inside a project. assignedTo must be a member of that project.
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, deadline, assignedTo, projectId } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!projectId) {
      return res.status(400).json({ message: 'projectId is required' });
    }

    const membership = await assertMembership(projectId, req.user.id);
    if (!membership.ok) {
      return res.status(membership.code).json({ message: membership.message });
    }

    if (assignedTo) {
      const assigneeIsMember = membership.project.members
        .map((m) => m.toString())
        .includes(assignedTo);
      if (!assigneeIsMember) {
        return res
          .status(400)
          .json({ message: 'Cannot assign a task to someone outside this project' });
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      deadline,
      assignedTo: assignedTo || null,
      authorId: req.user.id,
      projectId,
    });

    const populatedTask = await task.populate('assignedTo', 'name email');
    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/tasks?projectId=...
// @desc    Get all tasks for a project the logged-in user is a member of
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: 'projectId query param is required' });
    }

    const membership = await assertMembership(projectId, req.user.id);
    if (!membership.ok) {
      return res.status(membership.code).json({ message: membership.message });
    }

    const tasks = await Task.find({ projectId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task — only the creator can edit it, and only within their project
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: you do not own this task' });
    }

    const { title, description, status, priority, deadline, assignedTo } = req.body;

    if (assignedTo !== undefined && assignedTo) {
      const membership = await assertMembership(task.projectId, req.user.id);
      const assigneeIsMember = membership.project.members
        .map((m) => m.toString())
        .includes(assignedTo);
      if (!assigneeIsMember) {
        return res
          .status(400)
          .json({ message: 'Cannot assign a task to someone outside this project' });
      }
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (deadline !== undefined) task.deadline = deadline;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;

    const updatedTask = await task.save();
    const populatedTask = await updatedTask.populate('assignedTo', 'name email');
    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task — only if the logged-in user owns it
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: you do not own this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
