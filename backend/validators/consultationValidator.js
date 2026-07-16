const validateConsultation = (req, res, next) => {
  const {
    name = '',
    email = '',
    whatsapp = '',
  } = req.body;

  // Required fields
  if (!name.trim() || !email.trim() || !whatsapp.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Name, Email and WhatsApp number are required.',
    });
  }

  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.',
    });
  }

  // Remove spaces and hyphens
  const phone = whatsapp.replace(/[\s-]/g, '');

  // WhatsApp validation
  if (!/^\+?\d{2,15}$/.test(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid WhatsApp number.',
    });
  }

  next();
};

module.exports = { validateConsultation };
