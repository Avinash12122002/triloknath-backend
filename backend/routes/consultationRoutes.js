const express = require('express');
const { body } = require('express-validator');
const {
  createConsultation,
  getAllConsultations,
  getConsultation,
  updateConsultation,
  deleteConsultation,
} = require('../controllers/consultationController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation for consultation submission
const consultationValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('whatsapp').matches(/^\+?\d{2,15}$/).withMessage('Valid WhatsApp number required'),
];

// Public route — form submission from WordPress
router.post('/', consultationValidation, createConsultation);

// Protected routes — Admin panel
router.get('/', protect, getAllConsultations);
router.get('/:id', protect, getConsultation);
router.put('/:id', protect, requireRole('superadmin', 'admin'), updateConsultation);
router.delete('/:id', protect, requireRole('superadmin', 'admin'), deleteConsultation);

module.exports = router;
