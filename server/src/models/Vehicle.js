import mongoose from "mongoose";

const ownershipHistorySchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    transferredAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Notes cannot exceed 300 characters"],
    },
  },
  { _id: false },
);

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    vehicleType: {
      type: String,
      required: [true, "Vehicle type is required"],
      enum: ["CAR", "VAN", "MOTORCYCLE", "OTHER"],
    },
    make: {
      type: String,
      required: [true, "Vehicle make is required"],
      trim: true,
      maxlength: [50, "Make cannot exceed 50 characters"],
    },
    model: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true,
      maxlength: [50, "Model cannot exceed 50 characters"],
    },
    manufacturingYear: {
      type: Number,
      min: [1900, "Manufacturing year is invalid"],
      max: [new Date().getFullYear() + 1, "Manufacturing year is invalid"],
      default: null,
    },
    color: {
      type: String,
      trim: true,
      maxlength: [30, "Color cannot exceed 30 characters"],
      default: "",
    },
    vin: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },
    currentOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    ownershipHistory: {
      type: [ownershipHistorySchema],
      default: [],
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
  { timestamps: true },
);

vehicleSchema.index({ currentOwner: 1 });
vehicleSchema.index({ make: 1, model: 1 });
vehicleSchema.index({ createdAt: -1 });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
