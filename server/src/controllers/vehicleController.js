import mongoose from "mongoose";
import Vehicle from "../models/Vehicle.js";
import Customer from "../models/Customer.js";

export const createVehicle = async (req, res) => {
  try {
    const {
      registrationNumber,
      vehicleType,
      make,
      model,
      manufacturingYear,
      color,
      vin,
      currentOwner,
      notes,
    } = req.body;

    // Validate required fields.
    if (
      !registrationNumber?.trim() ||
      !vehicleType ||
      !make?.trim() ||
      !model?.trim() ||
      !currentOwner
    ) {
      return res.status(400).json({
        message:
          "Registration number, type, make, model, and owner are required.",
      });
    }

    // Validate owner ID.
    if (!mongoose.isValidObjectId(currentOwner)) {
      return res.status(400).json({
        message: "Invalid customer ID.",
      });
    }

    // Check whether the customer exists and is active.
    const customer = await Customer.findOne({
      _id: currentOwner,
      isActive: true,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Active customer not found.",
      });
    }

    // Normalize registration number.
    const normalizedRegistration = registrationNumber.trim().toUpperCase();

    // Check for an existing vehicle.
    const existingVehicle = await Vehicle.findOne({
      registrationNumber: normalizedRegistration,
    });

    if (existingVehicle) {
      return res.status(409).json({
        message: "A vehicle with this registration number already exists.",
      });
    }

    // Create the vehicle.
    const vehicle = await Vehicle.create({
      registrationNumber: normalizedRegistration,
      vehicleType,
      make,
      model,
      manufacturingYear: manufacturingYear || null,
      color,
      vin,
      currentOwner,
      ownershipHistory: [
        {
          customer: currentOwner,
          transferredAt: new Date(),
          notes: "Initial vehicle registration",
        },
      ],
      notes,
      createdBy: req.user._id,
    });

    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate("currentOwner", "customerCode fullName phone email")
      .populate("ownershipHistory.customer", "customerCode fullName")
      .populate("createdBy", "name email");

    return res.status(201).json({
      message: "Vehicle registered successfully.",
      vehicle: populatedVehicle,
    });
  } catch (error) {
    console.error("Create vehicle error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A vehicle with this registration number already exists.",
      });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to register vehicle.",
    });
  }
};

export const getVehicles = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      type = "all",
      status = "active",
    } = req.query;

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));

    const filter = {};

    // Filter by vehicle type.
    if (type !== "all") {
      const allowedTypes = ["CAR", "VAN", "MOTORCYCLE", "OTHER"];

      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          message: "Invalid vehicle type filter.",
        });
      }

      filter.vehicleType = type;
    }

    // Filter by status.
    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    } else if (status !== "all") {
      return res.status(400).json({
        message: "Invalid status filter.",
      });
    }

    // Search by registration number, make, model, or customer name.
    if (search.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const matchingCustomers = await Customer.find({
        fullName: { $regex: escapedSearch, $options: "i" },
      }).select("_id");

      filter.$or = [
        { registrationNumber: { $regex: escapedSearch, $options: "i" } },
        { make: { $regex: escapedSearch, $options: "i" } },
        { model: { $regex: escapedSearch, $options: "i" } },
        {
          currentOwner: {
            $in: matchingCustomers.map((customer) => customer._id),
          },
        },
      ];
    }

    const [vehicles, totalVehicles] = await Promise.all([
      Vehicle.find(filter)
        .populate("currentOwner", "customerCode fullName phone email")
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Vehicle.countDocuments(filter),
    ]);

    return res.status(200).json({
      vehicles,
      pagination: {
        currentPage,
        pageSize,
        totalVehicles,
        totalPages: Math.ceil(totalVehicles / pageSize),
      },
    });
  } catch (error) {
    console.error("Get vehicles error:", error);

    return res.status(500).json({
      message: "Failed to retrieve vehicles.",
    });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID.",
      });
    }

    const vehicle = await Vehicle.findById(id)
      .populate("currentOwner", "customerCode fullName phone email address")
      .populate("ownershipHistory.customer", "customerCode fullName phone")
      .populate("createdBy", "name email");

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found.",
      });
    }

    return res.status(200).json({
      vehicle,
    });
  } catch (error) {
    console.error("Get vehicle error:", error);

    return res.status(500).json({
      message: "Failed to retrieve vehicle.",
    });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID.",
      });
    }

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found.",
      });
    }

    const {
      registrationNumber,
      vehicleType,
      make,
      model,
      manufacturingYear,
      color,
      vin,
      notes,
    } = req.body;

    // Update registration number.
    if (registrationNumber !== undefined) {
      if (
        typeof registrationNumber !== "string" ||
        !registrationNumber.trim()
      ) {
        return res.status(400).json({
          message: "Registration number cannot be empty.",
        });
      }

      vehicle.registrationNumber = registrationNumber.trim().toUpperCase();
    }

    // Update vehicle type.
    if (vehicleType !== undefined) {
      vehicle.vehicleType = vehicleType;
    }

    // Update make.
    if (make !== undefined) {
      vehicle.make = make;
    }

    // Update model.
    if (model !== undefined) {
      vehicle.model = model;
    }

    // Update manufacturing year.
    if (manufacturingYear !== undefined) {
      vehicle.manufacturingYear =
        manufacturingYear === "" || manufacturingYear === null
          ? null
          : manufacturingYear;
    }

    // Update optional fields.
    if (color !== undefined) vehicle.color = color;
    if (vin !== undefined) vehicle.vin = vin || null;
    if (notes !== undefined) vehicle.notes = notes;

    await vehicle.save();

    const updatedVehicle = await Vehicle.findById(vehicle._id)
      .populate("currentOwner", "customerCode fullName phone email")
      .populate("ownershipHistory.customer", "customerCode fullName")
      .populate("createdBy", "name email");

    return res.status(200).json({
      message: "Vehicle updated successfully.",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error("Update vehicle error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A vehicle with this registration number already exists.",
      });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to update vehicle.",
    });
  }
};

export const transferVehicleOwnership = async (req, res) => {
  try {
    const { id } = req.params;
    const { newOwner, notes = "" } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID.",
      });
    }

    if (!mongoose.isValidObjectId(newOwner)) {
      return res.status(400).json({
        message: "Invalid new owner ID.",
      });
    }

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found.",
      });
    }

    if (!vehicle.isActive) {
      return res.status(400).json({
        message: "Cannot transfer an inactive vehicle.",
      });
    }

    if (vehicle.currentOwner.toString() === newOwner) {
      return res.status(400).json({
        message: "The selected customer is already the current owner.",
      });
    }

    const customer = await Customer.findOne({
      _id: newOwner,
      isActive: true,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Active customer not found.",
      });
    }

    // Update current owner and preserve ownership history.
    vehicle.currentOwner = newOwner;

    vehicle.ownershipHistory.push({
      customer: newOwner,
      transferredAt: new Date(),
      notes: notes.trim() || "Vehicle ownership transferred.",
    });

    await vehicle.save();

    const updatedVehicle = await Vehicle.findById(vehicle._id)
      .populate("currentOwner", "customerCode fullName phone email")
      .populate("ownershipHistory.customer", "customerCode fullName phone")
      .populate("createdBy", "name email");

    return res.status(200).json({
      message: "Vehicle ownership transferred successfully.",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error("Transfer vehicle ownership error:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to transfer vehicle ownership.",
    });
  }
};

export const updateVehicleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid vehicle ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "A valid vehicle status is required.",
      });
    }

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found.",
      });
    }

    vehicle.isActive = isActive;
    await vehicle.save();

    return res.status(200).json({
      message: `Vehicle ${isActive ? "activated" : "deactivated"} successfully.`,
      vehicle,
    });
  } catch (error) {
    console.error("Update vehicle status error:", error);

    return res.status(500).json({
      message: "Failed to update vehicle status.",
    });
  }
};
