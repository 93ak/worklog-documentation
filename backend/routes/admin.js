const router = require('express').Router();
const {
  getOverview,
  getUserLogs,
  getDayDrillDown,
  getEmployeeAnalytics,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/overview', getOverview);
router.get('/day/:date', getDayDrillDown);
router.get('/user/:id/logs', getUserLogs);
router.get('/user/:id/analytics', getEmployeeAnalytics);

module.exports = router;
