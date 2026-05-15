const Log = require('../models/Log');

// GET /api/logs/me — all logs for current user (newest first)
exports.getMyLogs = async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.user._id })
      .sort({ date: -1 })
      .lean();
    res.json(logs);
  } catch (err) {
    console.error('getMyLogs error:', err);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
};

// POST /api/logs — create a log for today (or any date)
exports.createLog = async (req, res) => {
  try {
    const { date, content } = req.body;

    if (!date || !content?.trim()) {
      return res.status(400).json({ message: 'Date and content are required' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
    }

    // Check for duplicate
    const existing = await Log.findOne({ userId: req.user._id, date });
    if (existing) {
      return res.status(409).json({ message: 'A log for this date already exists. Use edit instead.' });
    }

    const log = await Log.create({
      userId: req.user._id,
      date,
      content: content.trim(),
    });

    res.status(201).json(log);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A log for this date already exists.' });
    }
    console.error('createLog error:', err);
    res.status(500).json({ message: 'Failed to create log' });
  }
};

// PUT /api/logs/:id — update an existing log (only owner)
exports.updateLog = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Content cannot be empty' });
    }

    const log = await Log.findOne({ _id: req.params.id, userId: req.user._id });
    if (!log) {
      return res.status(404).json({ message: 'Log not found or access denied' });
    }

    log.content = content.trim();
    // Mongoose timestamps will auto-update updatedAt
    await log.save();

    res.json(log);
  } catch (err) {
    console.error('updateLog error:', err);
    res.status(500).json({ message: 'Failed to update log' });
  }
};
