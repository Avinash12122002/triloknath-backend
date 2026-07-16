const {
  createContactFormService,
  getAllContactFormsService,
  getContactFormByIdService,
  updateContactFormService,
  deleteContactFormService,
  getStatsService,
  exportContactFormsService,
} = require('../services/contactFormService');

// Create Contact Form
const createContactForm = async (req, res) => {
  try {
    const contactForm = await createContactFormService(req.body);

    res.status(201).json({
      success: true,
      message: 'Contact Form submitted successfully.',
      id: contactForm._id,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Get All Contact Forms
const getAllContactForms = async (req, res) => {
  try {
    const result = await getAllContactFormsService(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Get Contact Form By ID
const getContactForm = async (req, res) => {
  try {
    const contactForm = await getContactFormByIdService(req.params.id);

    if (!contactForm) {
      return res.status(404).json({
        success: false,
        message: 'Contact Form not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: contactForm,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Contact Form ID.',
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Update Contact Form
const updateContactForm = async (req, res) => {
  try {
    const contactForm = await updateContactFormService(
      req.params.id,
      req.body
    );

    if (!contactForm) {
      return res.status(404).json({
        success: false,
        message: 'Contact Form not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact Form updated successfully.',
      data: contactForm,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Contact Form ID.',
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Delete Contact Form
const deleteContactForm = async (req, res) => {
  try {
    const contactForm = await deleteContactFormService(req.params.id);

    if (!contactForm) {
      return res.status(404).json({
        success: false,
        message: 'Contact Form not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact Form deleted successfully.',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Contact Form ID.',
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Dashboard Stats
const getStats = async (req, res) => {
  try {
    const stats = await getStatsService();

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Export Contact Forms
const exportContactForms = async (req, res) => {
  try {
    const data = await exportContactFormsService();

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

module.exports = {
  createContactForm,
  getAllContactForms,
  getContactForm,
  updateContactForm,
  deleteContactForm,
  getStats,
  exportContactForms,
};
