import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    }
  );
};

// Login
export const loginService = async (data) => {
  const { email, password } = data;

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin || !admin.isActive) {
    const error = new Error("Invalid credentials or account deactivated.");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await admin.comparePassword(password);

  if (!isMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  return {
    token: generateToken(admin._id),
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      lastLogin: admin.lastLogin,
    },
  };
};

// Register
export const registerService = async (data) => {
  const { name, email, password, role, setupKey } = data;

  if (setupKey !== process.env.ADMIN_SETUP_KEY) {
    const error = new Error("Invalid setup key.");
    error.statusCode = 403;
    throw error;
  }

  const existing = await Admin.findOne({ email });

  if (existing) {
    const error = new Error("An admin with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const admin = await Admin.create({
    name,
    email,
    password,
    role: role || "admin",
  });

  return {
    token: generateToken(admin._id),
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};

// Get All Admins
export const getAllAdminsService = async () => {
  return Admin.find()
    .select("-password")
    .sort({ createdAt: -1 });
};

// Update Admin
export const updateAdminService = async (id, data) => {
  const { isActive, role } = data;

  return Admin.findByIdAndUpdate(
    id,
    {
      isActive,
      role,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");
};