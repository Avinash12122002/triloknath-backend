const express = require('express');

const {
  login,
  register,
  getMe,
  getAllAdmins,
  updateAdmin,
} = require('../controllers/authController');

const {
  protect,
  requireRole,
} = require('../middleware/authMiddleware');

const {
  loginValidation,
  registerValidation,
} = require('../validators/authValidator');

const router = express.Router();

// Public Routes
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);

// Protected Routes
router.get('/me', protect, getMe);

router.get(
  '/admins',
  protect,
  requireRole('superadmin'),
  getAllAdmins
);

router.put(
  '/admins/:id',
  protect,
  requireRole('superadmin'),
  updateAdmin
);

module.exports = router;
