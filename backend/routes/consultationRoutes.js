import express from "express";

import {
  createConsultation,
  getAllConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation,
} from "../controllers/consultationController.js";

import { validateConsultation } from "../validators/consultationValidator.js";

const router = express.Router();

router.post("/", validateConsultation, createConsultation);

router.get("/", getAllConsultations);

router.get("/:id", getConsultationById);

router.put("/:id", updateConsultation);

router.delete("/:id", deleteConsultation);

export default router;