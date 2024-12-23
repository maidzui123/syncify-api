import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

friendRequestSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

friendRequestSchema.set("toJSON", {
  virtuals: false,
  transform: function (doc, ret) {
    if (ret.fromUserId) {
      ret.userData = ret.fromUserId;
      delete ret.fromUserId;
    }
    return ret;
  },
});

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
