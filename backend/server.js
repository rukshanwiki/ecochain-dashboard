import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./auth.js";
import Declaration from "./Declaration.js"; // 1. Import your new model

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Auth Routes
app.use("/api/auth", authRoutes);

// --- DECLARATION ROUTES ---

// 2. Route to POST (save) a new entry from ProductDeclaration.js
app.post('/api/declarations', async (req, res) => {
  try {
    const newDeclaration = new Declaration(req.body);
    await newDeclaration.save();
    res.status(201).json({ success: true, data: newDeclaration });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Route to GET (fetch) all entries for Dashboard.js
app.get('/api/declarations', async (req, res) => {
  try {
    // Fetches all records and sorts them so the newest is at the top
    const declarations = await Declaration.find().sort({ createdAt: -1 }); 
    res.status(200).json({ success: true, data: declarations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- DATABASE CONNECTION ---

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

app.listen(5000, () => console.log("🚀 Server running on port 5000"));