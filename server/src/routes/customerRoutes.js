import express from "express";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  updateCustomerStatus,
} from "../controllers/customerController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a customer.
router.post("/", protect, authorize("MANAGER", "RECEPTIONIST"), createCustomer);

// Get all customers.
router.get("/", protect, authorize("MANAGER", "RECEPTIONIST"), getCustomers);

// Get a specific customer.
router.get(
  "/:id",
  protect,
  authorize("MANAGER", "RECEPTIONIST"),
  getCustomerById,
);

// Update customer information.
router.put(
  "/:id",
  protect,
  authorize("MANAGER", "RECEPTIONIST"),
  updateCustomer,
);

// Activate or deactivate a customer.
router.patch(
  "/:id/status",
  protect,
  authorize("MANAGER"),
  updateCustomerStatus,
);

export default router;
