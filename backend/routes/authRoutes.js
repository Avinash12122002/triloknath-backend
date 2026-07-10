const express = require('express');
const { body } = require('express-validator');
const { login, register, getMe, getAllAdmins, updateAdmin } = require('../controllers/authController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('setupKey').notEmpty().withMessage('Setup key is required'),
];

// Routes
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);
router.get('/me', protect, getMe);
router.get('/admins', protect, requireRole('superadmin'), getAllAdmins);
router.put('/admins/:id', protect, requireRole('superadmin'), updateAdmin);

module.exports = router;