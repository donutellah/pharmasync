const express = require('express');
const router = express.Router();
const { checkout } = require('../controllers/checkoutController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', checkout);

module.exports = router;
