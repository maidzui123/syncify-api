import mongoose from "mongoose";
import Joi from "joi";

const codeSchema = new mongoose.Schema({
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
  username: {
    type: String,
    trim: true,
    required: false,
  },
  code: {
    type: String,
    required: true,
  },
  expiredAt: {
    type: Date,
    default: () => new Date(Date.now() + 1 * 60 * 1000),
  },
});

const Code = mongoose.model("code_users", codeSchema);

const verifyCodeSchema = Joi.object({
  code: Joi.string().required().messages({
    "string.empty": "Code is required.",
  }),
  email: Joi.string().required().messages({
    "string.empty": "Email is required.",
  }),
});
export { Code, verifyCodeSchema };
