import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "users" },
  refreshToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Token = mongoose.model("tokens", tokenSchema);

export default Token;