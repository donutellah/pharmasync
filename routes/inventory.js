const express = require('express');
const router  = express.Router();
const {
  getAllInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require('../controllers/inventoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/',      getAllInventory);
router.get('/:id',   getInventoryItem);
router.post('/',     requireAdmin, createInventoryItem);
router.put('/:id',   requireAdmin, updateInventoryItem);
router.delete('/:id',requireAdmin, deleteInventoryItem);

module.exports = router;
