const { validationResult } = require('express-validator');
const Consultation = require('../models/Consultation');

// @desc    Submit consultation request from website form
// @route   POST /api/consultations
// @access  Public
const createConsultation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, whatsapp, countryCode, heading, sourceUrl } = req.body;

    const existing = await Consultation.findOne({ whatsapp });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted your details. Our team will contact you shortly.',
      });
    }

    const consultation = await Consultation.create({
      name,
      email,
      whatsapp,
      countryCode,
      heading,
      sourceUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Consultation request saved successfully.',
      id: consultation._id,
    });
  } catch (error) {
    console.error('Create Consultation error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all consultations (with optional status/heading filter)
// @route   GET /api/consultations
// @access  Private
const getAllConsultations = async (req, res) => {
  try {
    const { status = '', heading = '' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (heading) query.heading = heading;

    const consultations = await Consultation.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: consultations.length, consultations });
  } catch (error) {
    console.error('Get Consultations error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single consultation
// @route   GET /api/consultations/:id
// @access  Private
const getConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found.' });
    }
    res.status(200).json({ success: true, consultation });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update consultation
// @route   PUT /api/consultations/:id
// @access  Private
const updateConsultation = async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'whatsapp', 'countryCode', 'heading', 'status', 'notes'];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found.' });
    }

    res.status(200).json({ success: true, consultation });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete consultation
// @route   DELETE /api/consultations/:id
// @access  Private
const deleteConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found.' });
    }
    res.status(200).json({ success: true, message: 'Consultation deleted successfully.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createConsultation,
  getAllConsultations,
  getConsultation,
  updateConsultation,
  deleteConsultation,
};
