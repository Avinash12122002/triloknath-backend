const express = require('express');

const {
  createConsultation,
  getAllConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation,
} = require('../controllers/consultationController');

const { validateConsultation } = require('../validators/consultationValidator');

const router = express.Router();

router.post('/', validateConsultation, createConsultation);

router.get('/', getAllConsultations);

router.get('/:id', getConsultationById);

router.put('/:id', updateConsultation);

router.delete('/:id', deleteConsultation);

module.exports = router;
