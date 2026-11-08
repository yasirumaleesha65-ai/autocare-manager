import crypto from "crypto";
import bcrypt from "bcryptjs";

import EmailOTP from "../models/EmailOTP.js";
import { sendEmail } from "../utils/sendEmail.js";

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = async (otp) => {
  return bcrypt.hash(otp, 10);
};

export const createAndSendOTP = async (user, purpose) => {
  // Remove previous unused OTPs for this user and purpose.
  await EmailOTP.deleteMany({
    userId: user._id,
    purpose,
    usedAt: null,
  });

  // Generate a new OTP.
  const otp = generateOTP();

  // Hash the OTP.
  const otpHash = await hashOTP(otp);

  // Save OTP in MongoDB.
  await EmailOTP.create({
    userId: user._id,
    email: user.email,
    otpHash,
    purpose,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  // Send OTP through Gmail.
  await sendEmail({
    to: user.email,
    subject: "AutoCare Manager - Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>AutoCare Manager</h2>
        <p>Your verification code is:</p>

        <h1 style="letter-spacing: 5px;">${otp}</h1>

        <p>This code expires in 5 minutes.</p>

        <p>If you did not request this code, please ignore this email.</p>
      </div>
    `,
  });
};

export const verifyOTP = async (userId, submittedOTP, purpose) => {
  const otpRecord = await EmailOTP.findOne({
    userId,
    purpose,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new Error("OTP is invalid or expired.");
  }

  if (otpRecord.attempts >= 5) {
    throw new Error("Maximum OTP attempts exceeded.");
  }

  const isMatch = await bcrypt.compare(submittedOTP, otpRecord.otpHash);

  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    throw new Error("Incorrect OTP.");
  }

  otpRecord.usedAt = new Date();
  await otpRecord.save();

  return true;
};
