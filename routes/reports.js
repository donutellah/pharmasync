const express = require('express');
const router = express.Router();
const { getDailyReport, getWeeklyReport, getMonthlyReport } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/daily', getDailyReport);
router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);

module.exports = router;
