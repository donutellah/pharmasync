const express = require('express');
const router = express.Router();
const { getAllSales, getSaleById, processSale, voidSale } = require('../controllers/salesController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', getAllSales);
router.get('/:id', getSaleById);
router.post('/', processSale);
router.put('/:id/void', requireAdmin, voidSale);

module.exports = router;
