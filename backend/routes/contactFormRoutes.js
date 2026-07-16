const express = require('express');

const {
  createContactForm,
  getAllContactForms,
  getContactForm,
  updateContactForm,
  deleteContactForm,
  getStats,
  exportContactForms,
} = require('../controllers/contactFormController');

const {
  protect,
  requireRole,
} = require('../middleware/authMiddleware');

const {
  contactFormValidation,
} = require('../validators/contactFormValidator');

const router = express.Router();

// Public Route
router.post('/', contactFormValidation, createContactForm);

// Protected Routes
router.get('/stats', protect, getStats);

router.get('/export', protect, exportContactForms);

router.get('/', protect, getAllContactForms);

router.get('/:id', protect, getContactForm);

router.put(
  '/:id',
  protect,
  requireRole('superadmin', 'admin'),
  updateContactForm
);

router.delete(
  '/:id',
  protect,
  requireRole('superadmin', 'admin'),
  deleteContactForm
);

module.exports = router;
