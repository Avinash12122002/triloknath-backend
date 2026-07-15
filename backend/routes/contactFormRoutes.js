import express from "express";

import {
  createContactForm,
  getAllContactForms,
  getContactForm,
  updateContactForm,
  deleteContactForm,
  getStats,
  exportContactForms,
} from "../controllers/contactFormController.js";

import {
  protect,
  requireRole,
} from "../middleware/authMiddleware.js";

import {
  contactFormValidation,
} from "../validators/contactFormValidator.js";

const router = express.Router();

// Public Route
router.post("/", contactFormValidation, createContactForm);

// Protected Routes
router.get("/stats", protect, getStats);

router.get("/export", protect, exportContactForms);

router.get("/", protect, getAllContactForms);

router.get("/:id", protect, getContactForm);

router.put(
  "/:id",
  protect,
  requireRole("superadmin", "admin"),
  updateContactForm
);

router.delete(
  "/:id",
  protect,
  requireRole("superadmin", "admin"),
  deleteContactForm
);

export default router;