const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies the Bearer JWT in Authorization header.
 * Attaches req.user = { id, username, role } on success.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated — missing token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach lean user (no password) to request
    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user) return res.status(401).json({ message: 'User no longer exists' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired — please log in again' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * Must be used AFTER protect middleware.
 * Restricts access to admin role only.
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied — admin only' });
  }
  next();
};

module.exports = { protect, adminOnly };
