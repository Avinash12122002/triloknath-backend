import express from "express";

import {
  login,
  register,
  getMe,
  getAllAdmins,
  updateAdmin,
} from "../controllers/authController.js";

import {
  protect,
  requireRole,
} from "../middleware/authMiddleware.js";

import {
  loginValidation,
  registerValidation,
} from "../validators/authValidator.js";

const router = express.Router();

// Public Routes
router.post("/login", loginValidation, login);
router.post("/register", registerValidation, register);

// Protected Routes
router.get("/me", protect, getMe);

router.get(
  "/admins",
  protect,
  requireRole("superadmin"),
  getAllAdmins
);

router.put(
  "/admins/:id",
  protect,
  requireRole("superadmin"),
  updateAdmin
);

export default router;