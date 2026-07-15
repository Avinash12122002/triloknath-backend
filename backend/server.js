import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import contactFormRoutes from "./routes/contactFormRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Security
app.use(helmet());

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:5173",
  // "https://yourdomain.com",
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow Postman, curl, etc.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Simple Rate Limiter
const submissionCounts = new Map();

const simpleRateLimit = (maxRequests, windowMs) => {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    const windowData =
      submissionCounts.get(ip) || {
        count: 0,
        resetAt: now + windowMs,
      };

    if (now > windowData.resetAt) {
      windowData.count = 0;
      windowData.resetAt = now + windowMs;
    }

    windowData.count++;

    submissionCounts.set(ip, windowData);

    if (windowData.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }

    next();
  };
};

// Routes
app.use("/api/auth", authRoutes);

app.use(
  "/api/contactForm",
  simpleRateLimit(10000, 15 * 60 * 1000),
  contactFormRoutes
);

app.use(
  "/api/consultations",
  simpleRateLimit(10000, 15 * 60 * 1000),
  consultationRoutes
);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Recruitment CRM API is running.",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});

export default app;