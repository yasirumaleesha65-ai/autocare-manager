import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated. Please log in.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "AUTH") {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }
    const user = await User.findById(decoded.userId).select("-passwordHash");
    if ((decoded.tokenVersion ?? 0) !== user.tokenVersion) {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }

    if (!user || !user.isActive || !user.isEmailVerified) {
      return res.status(401).json({
        message: "Your account is unavailable.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired authentication token.",
    });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    }

    next();
  };
};
