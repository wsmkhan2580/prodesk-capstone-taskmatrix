const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FileUpload = require('../models/FileUpload');
const Project = require('../models/Project');
const protect = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// @route   POST /api/files/upload
// @desc    Upload a file to a project. Requires a projectId (must be a member)
//          and a short note explaining why the file is relevant.
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { projectId, note } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file selected' });
    }
    if (!projectId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Please select a project for this file' });
    }
    if (!note || !note.trim()) {
      fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .json({ message: 'Please add a short note explaining why this file is needed' });
    }

    const project = await Project.findById(projectId);
    if (!project || !project.members.map((m) => m.toString()).includes(req.user.id)) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'Forbidden: not a member of this project' });
    }

    const fileDoc = await FileUpload.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype,
      ownerId: req.user.id,
      projectId,
      note: note.trim(),
    });

    res.status(201).json(fileDoc);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET /api/files?projectId=...
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: 'projectId query param is required' });
    }

    const project = await Project.findById(projectId);
    if (!project || !project.members.map((m) => m.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden: not a member of this project' });
    }

    const files = await FileUpload.find({ projectId }).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/files/:id
router.delete('/:id', async (req, res) => {
  try {
    const file = await FileUpload.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    if (file.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: you do not own this file' });
    }

    const filePath = path.join(uploadDir, file.storedName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await file.deleteOne();
    res.json({ message: 'File deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
