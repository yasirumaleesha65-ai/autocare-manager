import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

import connectDB from "../config/database.js";
import User from "../models/User.js";

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

const createManager = async () => {
  try {
    await connectDB();

    // Check whether a manager already exists.
    const existingManager = await User.findOne({
      role: "MANAGER",
    });

    if (existingManager) {
      console.log("A Manager account already exists.");
      return;
    }

    console.log("\n=== AutoCare Manager - Initial Setup ===\n");

    const name = await rl.question("Manager name: ");
    const email = await rl.question("Manager email: ");
    const password = await rl.question("Manager password: ");

    if (!name.trim() || !email.trim() || !password) {
      throw new Error("All fields are required.");
    }

    if (password.length < 12) {
      throw new Error("Manager password must contain at least 12 characters.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "MANAGER",
      isActive: true,
      isEmailVerified: true,
    });

    console.log("\nManager account created successfully!");
  } catch (error) {
    console.error("\nManager setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
};

createManager();
