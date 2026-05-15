const router = require('express').Router();
const { getMyLogs, createLog, updateLog } = require('../controllers/logController');
const { protect } = require('../middleware/auth');

router.use(protect); // all log routes require auth

router.get('/me', getMyLogs);
router.post('/', createLog);
router.put('/:id', updateLog);

module.exports = router;
