import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  content: { type: String, required: true },
  payload: { type: Object, required: true },
  type: {
    type: String,
    enum: ["like", "comment", "replyComment", "friendRequest", "share"],
    required: true,
  },
  isRead: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notifications", notificationSchema);

export default Notification;
