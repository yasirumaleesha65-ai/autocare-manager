import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      required: true,
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["MANAGER", "RECEPTIONIST", "MECHANIC", "INVENTORY"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
