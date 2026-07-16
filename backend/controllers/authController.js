const {
  loginService,
  registerService,
  getAllAdminsService,
  updateAdminService,
} = require('../services/authService');

// Login
const login = async (req, res) => {
  try {
    const result = await loginService(req.body);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      ...result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Register
const register = async (req, res) => {
  try {
    const result = await registerService(req.body);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully.',
      ...result,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Get Current Admin
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      admin: req.admin,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Get All Admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await getAllAdminsService();

    res.status(200).json({
      success: true,
      count: admins.length,
      admins,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Update Admin
const updateAdmin = async (req, res) => {
  try {
    const admin = await updateAdminService(req.params.id, req.body);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully.',
      admin,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin ID.',
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

module.exports = { login, register, getMe, getAllAdmins, updateAdmin };
