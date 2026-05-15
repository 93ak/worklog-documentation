const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Stored as YYYY-MM-DD string for easy querying without timezone issues
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Enforce one log per user per date
logSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Log', logSchema);
