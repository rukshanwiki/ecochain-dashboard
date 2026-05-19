import mongoose from "mongoose";

const declarationSchema = new mongoose.Schema({
  product: { type: String, required: true },
  area: { type: Number, required: true },
  units: { type: Number, required: true },
  cultivationStart: { type: String, required: true },
  cultivationDays: { type: String, required: true },
  cultivationEnd: { type: String },
  growthDuration: { type: String, required: true },
  harvestDays: { type: String, required: true },
  harvestingDate: { type: String },
  harvestingEnd: { type: String },
  province: { type: String, required: true },
  district: { type: String, required: true },
  comments: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Using ES Module export to match your setup
export default mongoose.model("Declaration", declarationSchema);