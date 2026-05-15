const router = require('express').Router();
const { login, me, requestReset, resetPassword } = require('../controllers/authController');const { protect } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, me);
router.post('/request-reset', requestReset);
router.post('/reset-password', resetPassword);
module.exports = router;
