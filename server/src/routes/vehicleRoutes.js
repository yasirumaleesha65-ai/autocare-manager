import express from "express";

import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  transferVehicleOwnership,
  updateVehicleStatus,
} from "../controllers/vehicleController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manager and Receptionist access.
router.post("/", protect, authorize("MANAGER", "RECEPTIONIST"), createVehicle);
router.get("/", protect, authorize("MANAGER", "RECEPTIONIST"), getVehicles);
router.get(
  "/:id",
  protect,
  authorize("MANAGER", "RECEPTIONIST"),
  getVehicleById,
);
router.put(
  "/:id",
  protect,
  authorize("MANAGER", "RECEPTIONIST"),
  updateVehicle,
);
router.patch(
  "/:id/transfer",
  protect,
  authorize("MANAGER", "RECEPTIONIST"),
  transferVehicleOwnership,
);

// Manager-only access.
router.patch("/:id/status", protect, authorize("MANAGER"), updateVehicleStatus);

export default router;
