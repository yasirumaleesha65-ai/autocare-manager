import mongoose from "mongoose";

const emailOTPSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["REGISTRATION", "PASSWORD_RESET", "PASSWORD_CHANGE"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Automatically delete expired OTP documents.
emailOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailOTP = mongoose.model("EmailOTP", emailOTPSchema);

export default EmailOTP;
