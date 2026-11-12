import mongoose from "mongoose";
import { getNextSequence } from "../services/counterService.js";

const customerSchema = new mongoose.Schema(
  {
    customerCode: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Customer name cannot exceed 100 characters"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      maxlength: [300, "Address cannot exceed 300 characters"],
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
customerSchema.pre("validate", async function () {
  if (!this.isNew || this.customerCode) {
    return;
  }

  const sequence = await getNextSequence("customer");

  this.customerCode = `CUS-${String(sequence).padStart(5, "0")}`;
});

// Customer search indexes
customerSchema.index({ fullName: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });

// Sort customers by registration date
customerSchema.index({ createdAt: -1 });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
