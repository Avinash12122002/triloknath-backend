const express = require('express');
const { body } = require('express-validator');
const {
  createConsultation,
  getAllConsultations,
  getConsultation,
  updateConsultation,
  deleteConsultation,
  getStats,
  exportConsultations,
} = require('../controllers/consultationController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation for form submission
const consultationValidation = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').matches(/^[0-9]{7,15}$/).withMessage('Valid phone number required (7-15 digits)'),
  body('companyCountry').notEmpty().withMessage('Company country is required'),
  body('hiringCountry').notEmpty().withMessage('Hiring country is required'),
  body('services').isArray({ min: 1 }).withMessage('At least one service must be selected'),
];

// Public route — form submission from WordPress
router.post('/', consultationValidation, createConsultation);

// Protected routes — Admin panel
router.get('/stats', protect, getStats);
router.get('/export', protect, exportConsultations);
router.get('/', protect, getAllConsultations);
router.get('/:id', protect, getConsultation);
router.put('/:id', protect, requireRole('superadmin', 'admin'), updateConsultation);
router.delete('/:id', protect, requireRole('superadmin', 'admin'), deleteConsultation);

module.exports = router;