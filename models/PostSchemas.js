import mongoose from "mongoose";
import { commentSchema } from "./CommentSchemas.js";
import Joi from "joi";

const postSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  media: [
    {
      url: { type: String },
      type: { type: String, enum: ["image", "video", "audio"], required: true },
    },
  ],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [commentSchema],
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  privacy: {
    type: String,
    enum: ["public", "private", "friends"],
    default: "public",
  },
  isArchived: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

postSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const createPostSchema = Joi.object({
  content: Joi.string().required().messages({
    "string.empty": "Username is required.",
  }),
  media: Joi.array().required().messages({
    "string.empty": "Email is required.",
  }),
  privacy: Joi.string(),
});

const Post = mongoose.model("Post", postSchema);

export { Post, createPostSchema };
