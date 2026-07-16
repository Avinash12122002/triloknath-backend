// Login Validation
const loginValidation = (req, res, next) => {
  const {
    email = '',
    password = '',
  } = req.body;

  if (!email.trim() || !password.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email and Password are required.',
    });
  }

  // Email Validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.',
    });
  }

  next();
};

// Register Validation
const registerValidation = (req, res, next) => {
  const {
    name = '',
    email = '',
    password = '',
    setupKey = '',
  } = req.body;

  // Required Fields
  if (
    !name.trim() ||
    !email.trim() ||
    !password.trim() ||
    !setupKey.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: 'Name, Email, Password and Setup Key are required.',
    });
  }

  // Name Validation
  if (name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name must be at least 2 characters.',
    });
  }

  // Email Validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid email address.',
    });
  }

  // Password Validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters.',
    });
  }

  next();
};

module.exports = { loginValidation, registerValidation };
