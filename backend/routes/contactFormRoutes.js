const express = require('express');
const { body } = require('express-validator');
const {
  createContactForm,
  getAllContactForms,
  getContactForm,
  updateContactForm,
  deleteContactForm,
  getStats,
  exportContactForms,
} = require('../controllers/contactFormController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation for form submission
const contactFormValidation = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').matches(/^[0-9]{7,15}$/).withMessage('Valid phone number required (7-15 digits)'),
  body('companyCountry').notEmpty().withMessage('Company country is required'),
  body('hiringCountry').notEmpty().withMessage('Hiring country is required'),
  body('services').isArray({ min: 1 }).withMessage('At least one service must be selected'),
];

// Public route — form submission from WordPress
router.post('/', contactFormValidation, createContactForm);

// Protected routes — Admin panel
router.get('/stats', protect, getStats);
router.get('/export', protect, exportContactForms);
router.get('/', protect, getAllContactForms);
router.get('/:id', protect, getContactForm);
router.put('/:id', protect, requireRole('superadmin', 'admin'), updateContactForm);
router.delete('/:id', protect, requireRole('superadmin', 'admin'), deleteContactForm);

module.exports = router;