import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  nic: { type: String, required: true, unique: true },
  farmerRegNo: { type: String, required: true, unique: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "farmer" }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;