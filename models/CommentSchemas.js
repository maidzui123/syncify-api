import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  replies: [
    {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

commentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Comment = mongoose.model("comments", commentSchema);

export { Comment, commentSchema };
