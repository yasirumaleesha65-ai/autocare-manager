import express from "express";

import {
  registerStaff,
  verifyRegistrationOTP,
  setStaffPassword,
  login,
  logout,
  getMe,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manager creates a staff account.
router.post("/register", protect, authorize("MANAGER"), registerStaff);

// Staff verifies registration OTP.
router.post("/verify-registration", verifyRegistrationOTP);

// Staff sets their password.
router.post("/set-password", setStaffPassword);

router.post("/login", login);

router.post("/logout", logout);

router.get("/me", protect, getMe);

router.post("/forgot-password", forgotPassword);

router.post("/verify-reset-otp", verifyResetOTP);

router.post("/reset-password", resetPassword);
router.post("/change-password", protect, changePassword);
export default router;
