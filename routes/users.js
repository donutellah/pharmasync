const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, createUser, changePassword, deleteUser } = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken, requireAdmin);

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id/role', updateUserRole);
router.put('/:id/password', changePassword);
router.delete('/:id', deleteUser);

module.exports = router;
