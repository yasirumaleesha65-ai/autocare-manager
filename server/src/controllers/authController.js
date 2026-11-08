import User from "../models/User.js";
import { createAndSendOTP, verifyOTP } from "../services/otpService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerStaff = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        message: "Name, email and role are required.",
      });
    }

    const allowedRoles = ["MANAGER", "RECEPTIONIST", "MECHANIC", "INVENTORY"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid staff role.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      role,
      passwordHash: null,
      isActive: true,
      isEmailVerified: false,
    });

    await createAndSendOTP(user, "REGISTRATION");

    return res.status(201).json({
      message: "Staff account created. Verification OTP sent.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Staff registration error:", error);

    return res.status(500).json({
      message: "Unable to create staff account.",
    });
  }
};

export const verifyRegistrationOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        message: "User ID and OTP are required.",
      });
    }

    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      return res.status(404).json({
        message: "User not found or inactive.",
      });
    }

    if (user.isEmailVerified || user.passwordHash) {
      return res.status(400).json({
        message: "Registration has already been completed.",
      });
    }

    await verifyOTP(user._id, otp, "REGISTRATION");

    // Generate a short-lived registration token.
    const registrationToken = jwt.sign(
      {
        userId: user._id.toString(),
        purpose: "REGISTRATION",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      },
    );

    return res.status(200).json({
      message: "Email verified successfully.",
      registrationToken,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const setStaffPassword = async (req, res) => {
  try {
    const { password } = req.body;

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Registration token is required.",
      });
    }

    const registrationToken = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(registrationToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        message: "Registration token is invalid or expired.",
      });
    }

    if (decoded.purpose !== "REGISTRATION") {
      return res.status(403).json({
        message: "Invalid token purpose.",
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(404).json({
        message: "User not found or inactive.",
      });
    }

    if (user.isEmailVerified || user.passwordHash) {
      return res.status(400).json({
        message: "Registration has already been completed.",
      });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.isEmailVerified = true;

    await user.save();

    return res.status(200).json({
      message: "Registration completed successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Set password error:", error);

    return res.status(500).json({
      message: "Unable to complete registration.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields.
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // Find user by email.
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Check account status.
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated.",
      });
    }

    if (!user.isEmailVerified || !user.passwordHash) {
      return res.status(403).json({
        message: "Please complete your account registration first.",
      });
    }

    // Compare password with stored hash.
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Generate JWT.
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        purpose: "AUTH",
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Store JWT in HTTP-only cookie.
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Unable to log in.",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      message: "Unable to log out.",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Unable to retrieve user information.",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      isActive: true,
      isEmailVerified: true,
    });

    // Always return the same response to avoid revealing
    // whether an email address has an account.
    if (!user) {
      return res.status(200).json({
        message:
          "If an eligible account exists, a verification code has been sent.",
      });
    }

    await createAndSendOTP(user, "PASSWORD_RESET");

    return res.status(200).json({
      message:
        "If an eligible account exists, a verification code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Unable to process your request.",
    });
  }
};

export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      isActive: true,
      isEmailVerified: true,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification code.",
      });
    }

    await verifyOTP(user._id, otp, "PASSWORD_RESET");

    const resetToken = jwt.sign(
      {
        userId: user._id.toString(),
        purpose: "PASSWORD_RESET",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      },
    );

    return res.status(200).json({
      message: "OTP verified successfully.",
      resetToken,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Password reset token is required.",
      });
    }

    const resetToken = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        message: "Invalid or expired reset token.",
      });
    }

    if (decoded.purpose !== "PASSWORD_RESET") {
      return res.status(403).json({
        message: "Invalid token purpose.",
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      isActive: true,
      isEmailVerified: true,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found or inactive.",
      });
    }

    user.passwordHash = await bcrypt.hash(password, 12);

    user.tokenVersion += 1;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Unable to reset password.",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from your current password.",
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.tokenVersion += 1;

    await user.save();

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Password changed successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Unable to change password.",
    });
  }
};
