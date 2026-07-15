import mongoose from "mongoose";

const contactFormSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        "Please enter a valid email",
      ],
    },

    phoneCode: {
      type: String,
      required: true,
      trim: true,
      default: "+91",
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\d{7,15}$/, "Phone number must be between 7 and 15 digits"],
    },

    fullPhone: {
      type: String,
      trim: true,
      index: true,
    },

    companyCountry: {
      type: String,
      required: [true, "Company country is required"],
      trim: true,
    },

    hiringCountry: {
      type: String,
      required: [true, "Hiring country is required"],
      trim: true,
    },

    services: {
      type: [String],
      required: [true, "At least one service must be selected"],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Please select at least one service.",
      },
    },

    headcount: {
      type: String,
      trim: true,
      default: "",
    },

    industry: {
      type: String,
      trim: true,
      default: "",
    },

    message: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    source: {
      type: String,
      trim: true,
      default: "contact-form",
    },

    pageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    submittedAt: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "New",
        "In Progress",
        "Contacted",
        "Converted",
        "Closed",
      ],
      default: "New",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    assignedTo: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
contactFormSchema.index({ email: 1 });
contactFormSchema.index({ status: 1 });
contactFormSchema.index({ createdAt: -1 });
contactFormSchema.index({ companyCountry: 1 });
contactFormSchema.index({ hiringCountry: 1 });

export default mongoose.model("ContactForm", contactFormSchema);