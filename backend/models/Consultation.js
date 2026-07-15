import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address.",
      ],
    },

    whatsapp: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^\+?\d{2,15}$/,
        "Please enter a valid WhatsApp number.",
      ],
    },

    countryCode: {
      type: String,
      trim: true,
      default: "+61",
    },

    heading: {
      type: String,
      trim: true,
      default: "Book Your FREE Meeting With Us",
    },

    sourceUrl: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Converted"],
      default: "New",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Consultation", consultationSchema);