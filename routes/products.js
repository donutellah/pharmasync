const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getExpiringProducts
} = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All product routes require authentication
router.use(authenticateToken);

router.get('/low-stock', getLowStockProducts);         // must be before /:id
router.get('/expiring', getExpiringProducts);          // must be before /:id
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', requireAdmin, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

module.exports = router;
