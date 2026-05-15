const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/mailer');

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName || user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// GET /api/auth/me — validate stored token & return fresh user info
exports.me = async (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    displayName: req.user.displayName || req.user.username,
    role: req.user.role,
  });
};

// ── POST /api/auth/request-reset ─────────────────────────────────────────────
// Accepts: { email }
// Always responds with the same success message to prevent user enumeration.
exports.requestReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'A valid email address is required' });
    }
 
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    console.log("USER FOUND:", !!user);
    console.log("EMAIL:", email);
    // Even if user not found, return identical response (prevents email enumeration)
    if (!user) {
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }
 
    // Generate a cryptographically secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
 
    // Store hashed token in DB — raw token travels only in the email link
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
 
    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes
    await user.save({ validateBeforeSave: false });
 
    // Build reset link using CLIENT_ORIGIN from env
    const resetLink = `${process.env.CLIENT_ORIGIN}/reset-password/${rawToken}`;
 
    console.log("ABOUT TO SEND EMAIL");
    await sendPasswordResetEmail(user.email, resetLink);
    console.log("EMAIL FUNCTION COMPLETED"); 
    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error('Request reset error:', err);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
};
 
// ── POST /api/auth/reset-password ────────────────────────────────────────────
// Accepts: { token, password }
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
 
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
 
    // Hash incoming token to compare against DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
 
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() }, // token not expired
    });
 
    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }
 
    // Update password — pre-save hook will hash it
    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();
 
    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
};