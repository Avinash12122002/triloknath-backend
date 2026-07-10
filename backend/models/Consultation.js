const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please enter a valid email'],
    },
    phoneCode: {
      type: String,
      default: '+91',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    fullPhone: {
      type: String,
      trim: true,
    },
    companyCountry: {
      type: String,
      required: [true, 'Company country is required'],
    },
    hiringCountry: {
      type: String,
      required: [true, 'Hiring country is required'],
    },
    services: {
      type: [String],
      required: [true, 'At least one service must be selected'],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Please select at least one service',
      },
    },
    headcount: {
      type: String,
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    source: {
      type: String,
      default: 'website-recruitment-consultation',
    },
    pageUrl: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Contacted', 'Converted', 'Closed'],
      default: 'New',
    },
    notes: {
      type: String,
      default: '',
    },
    assignedTo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
consultationSchema.index({ email: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ createdAt: -1 });
consultationSchema.index({ companyCountry: 1 });
consultationSchema.index({ hiringCountry: 1 });

module.exports = mongoose.model('Consultation', consultationSchema);