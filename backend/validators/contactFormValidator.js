const contactFormValidation = (req, res, next) => {
  const {
    firstName = '',
    lastName = '',
    email = '',
    phoneCode = '',
    phone = '',
    companyCountry = '',
    hiringCountry = '',
    services = [],
  } = req.body;

  // Required Fields
  if (
    !firstName.trim() ||
    !lastName.trim() ||
    !email.trim() ||
    !phoneCode.trim() ||
    !phone.trim() ||
    !companyCountry.trim() ||
    !hiringCountry.trim()
  ) {
    return res.status(400).json({
      success: false,
      message:
        'First Name, Last Name, Email, Country Code, Phone, Company Country and Hiring Country are required.',
    });
  }

  // First Name Validation
  if (firstName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'First name must be at least 2 characters.',
    });
  }

  // Last Name Validation
  if (lastName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Last name must be at least 2 characters.',
    });
  }

  // Email Validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.',
    });
  }

  // Country Code Validation
  if (!/^\+\d{1,4}(-\d{1,4})?$/.test(phoneCode.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please select a valid country code.',
    });
  }

  // Phone Validation
  if (!/^\d{7,15}$/.test(phone.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Phone number must be between 7 and 15 digits.',
    });
  }

  // Services Validation
  if (
    !Array.isArray(services) ||
    services.length === 0 ||
    services.some(
      (service) => typeof service !== 'string' || !service.trim()
    )
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please select at least one service.',
    });
  }

  next();
};

module.exports = { contactFormValidation };
