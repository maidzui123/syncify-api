import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatId: [{ type: mongoose.Schema.Types.ObjectId, ref: "chats" }],
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  content: { type: String, required: true },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updateddAt: { type: Date, default: Date.now },
});

messageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Message = mongoose.model("messages", messageSchema);

export default Message;
