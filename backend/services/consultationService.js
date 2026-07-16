const Consultation = require('../models/Consultation');

// Create Consultation
const createConsultationService = async (data) => {
  const existing = await Consultation.findOne({
    whatsapp: data.whatsapp,
  });

  if (existing) {
    const error = new Error(
      'You have already submitted your details. Our team will contact you shortly.'
    );

    error.statusCode = 409;

    throw error;
  }

  return Consultation.create(data);
};

// Get All Consultations
const getAllConsultationsService = async (filter = {}) => {
  return Consultation.find(filter).sort({ createdAt: -1 });
};

// Get Consultation By ID
const getConsultationByIdService = async (id) => {
  return Consultation.findById(id);
};

// Update Consultation
const updateConsultationService = async (id, data) => {
  return Consultation.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

// Delete Consultation
const deleteConsultationService = async (id) => {
  return Consultation.findByIdAndDelete(id);
};

module.exports = {
  createConsultationService,
  getAllConsultationsService,
  getConsultationByIdService,
  updateConsultationService,
  deleteConsultationService,
};
