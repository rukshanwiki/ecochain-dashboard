import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./User.js";

const router = express.Router();

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { fullName, nic, farmerRegNo, province, district, email, mobile, password } = req.body;

    if (!fullName || !nic || !farmerRegNo || !province || !district || !email || !mobile || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingFarmer = await User.findOne({ farmerRegNo });
    if (existingFarmer) {
      return res.status(400).json({ success: false, message: "Farmer already registered" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      nic,
      farmerRegNo,
      province,
      district,
      email,
      mobile,
      password: hashedPassword,
      role: "farmer",
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    return res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { farmerRegNo, password } = req.body;

    if (!farmerRegNo || !password) {
      return res.status(400).json({
        success: false,
        message: "Farmer registration number and password are required",
      });
    }

    const user = await User.findOne({ farmerRegNo });
    if (!user) {
      return res.status(404).json({ success: false, message: "Farmer not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user._id, farmerRegNo: user.farmerRegNo, role: user.role },
      process.env.JWT_SECRET || "ecoChainSecret",
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        farmerRegNo: user.farmerRegNo,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
});

export default router;
