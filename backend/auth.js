import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./User.js";

const router = express.Router();

// ✅ CHECK NIC (Real-time)
router.get("/check-nic/:nic", async (req, res) => {
  try {
    const existingUser = await User.findOne({ nic: req.params.nic });
    res.json({ exists: !!existingUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error checking NIC" });
  }
});

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { fullName, nic, farmerRegNo, province, district, mobile, password } = req.body;

    // 1. Check mandatory fields 
    if (!fullName || !nic || !farmerRegNo || !province || !district || !mobile || !password) {
      return res.status(400).json({ success: false, message: "Please fill all required fields (*)" });
    }

    // 2. Uniqueness checks
    const existingNIC = await User.findOne({ nic });
    if (existingNIC) return res.status(400).json({ success: false, message: "NIC already registered" });

    const existingFarmer = await User.findOne({ farmerRegNo });
    if (existingFarmer) return res.status(400).json({ success: false, message: "Farmer Reg No already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      nic,
      farmerRegNo,
      province,
      district,
      mobile,
      password: hashedPassword,
      role: "farmer",
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "Registration successful" });

  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ success: false, message: "Database error: " + err.message });
  }
});

// ✅ LOGIN (Keep your existing login code...)
// ...
export default router;