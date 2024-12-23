import mongoose from "mongoose";
import Joi from "joi";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      "Email format is not correct",
    ],
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  avatar: {
    type: String,
    required: false,
    default: null,
  },
  username: {
    type: String,
    trim: true,
    required: false,
  },
  displayName: {
    type: String,
    trim: true,
    required: false,
  },
  tag: {
    type: String,
    trim: true,
    required: false,
    validate: {
      validator: function (value) {
        return value.length === 4;
      },
      message: "Tag must be exactly 4 characters long",
    },
  },
  gender: {
    type: String,
    required: false,
    enum: ["Male", "Female", "Other"],
  },
  dob: {
    type: Date,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: [],
    },
  ],
  isGoogle: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isOnline: {
    type: Boolean,
    default: false,
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

userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model("Users", userSchema);

const registerSchema = Joi.object({
  username: Joi.string().required().messages({
    "string.empty": "Username is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email.",
  }),
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 8 characters.",
  }),
});

export { User, registerSchema };
