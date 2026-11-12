import Customer from "../models/Customer.js";
import mongoose from "mongoose";

export const createCustomer = async (req, res) => {
  try {
    const { fullName, phone, email, address, notes, confirmDuplicate } =
      req.body;

    // Validate required fields.
    if (!fullName?.trim() || !phone?.trim()) {
      return res.status(400).json({
        message: "Customer name and phone number are required.",
      });
    }

    // Find possible duplicate customers.
    const duplicateConditions = [{ phone: phone.trim() }];

    if (email?.trim()) {
      duplicateConditions.push({
        email: email.trim().toLowerCase(),
      });
    }

    const duplicates = await Customer.find({
      $or: duplicateConditions,
    })
      .select("customerCode fullName phone email")
      .limit(5);

    // Warn the user before creating a possible duplicate.
    if (duplicates.length > 0 && confirmDuplicate !== true) {
      return res.status(409).json({
        code: "POSSIBLE_DUPLICATE",
        message:
          "Similar customers already exist. Please review them before continuing.",
        matches: duplicates,
      });
    }

    // Create the customer.
    const customer = await Customer.create({
      fullName,
      phone,
      email: email?.trim() || null,
      address,
      notes,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Customer created successfully.",
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A customer with this customer code already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Something went wrong while creating the customer.",
    });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10, status = "all" } = req.query;

    // Validate pagination values.
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));

    // Build the database query.
    const filter = {};

    // Filter by active/inactive status.
    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    } else if (status !== "all") {
      return res.status(400).json({
        message: "Invalid customer status filter.",
      });
    }

    // Search by customer code, name, phone, or email.
    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      filter.$or = [
        { customerCode: searchRegex },
        { fullName: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
      ];
    }

    // Retrieve customers and total count.
    const [customers, totalCustomers] = await Promise.all([
      Customer.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Customer.countDocuments(filter),
    ]);

    return res.status(200).json({
      customers,
      pagination: {
        currentPage,
        pageSize,
        totalCustomers,
        totalPages: Math.ceil(totalCustomers / pageSize),
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      message: "Something went wrong while retrieving customers.",
    });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether the supplied ID is a valid MongoDB ObjectId.
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid customer ID.",
      });
    }

    // Find the customer.
    const customer = await Customer.findById(id)
      .populate("createdBy", "name email")
      .lean();

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      customer,
    });
  } catch (error) {
    console.error("Get customer by ID error:", error);

    return res.status(500).json({
      message: "Something went wrong while retrieving the customer.",
    });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, email, address, notes } = req.body;

    // Validate the customer ID.
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid customer ID.",
      });
    }

    // Check whether the customer exists.
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    // Validate required fields when provided.
    if (fullName !== undefined) {
      if (!fullName.trim()) {
        return res.status(400).json({
          message: "Customer name cannot be empty.",
        });
      }

      customer.fullName = fullName;
    }

    if (phone !== undefined) {
      if (!phone.trim()) {
        return res.status(400).json({
          message: "Phone number cannot be empty.",
        });
      }

      customer.phone = phone;
    }

    if (email !== undefined) {
      customer.email = email.trim() ? email.trim().toLowerCase() : null;
    }

    if (address !== undefined) {
      customer.address = address;
    }

    if (notes !== undefined) {
      customer.notes = notes;
    }

    // Save the updated customer.
    await customer.save();

    return res.status(200).json({
      message: "Customer updated successfully.",
      customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Something went wrong while updating the customer.",
    });
  }
};

export const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validate the customer ID.
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid customer ID.",
      });
    }

    // Validate the status value.
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "A valid customer status is required.",
      });
    }

    // Find the customer.
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    // Update the customer's status.
    customer.isActive = isActive;

    await customer.save();

    return res.status(200).json({
      message: `Customer ${isActive ? "activated" : "deactivated"} successfully.`,
      customer,
    });
  } catch (error) {
    console.error("Update customer status error:", error);

    return res.status(500).json({
      message: "Something went wrong while updating customer status.",
    });
  }
};
