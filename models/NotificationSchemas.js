import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  payload: { type: Object, required: true },
  type: {
    type: String,
    enum: [
      "like",
      "comment",
      "replyComment",
      "acceptFriendRequest",
      "friendRequest",
      "share",
      "adminNotification",
    ],
    required: true,
  },
  isRead: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("notifications", notificationSchema);

export default Notification;
