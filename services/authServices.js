import { User } from "../models/UserSchemas.js";
import { Code } from "../models/CodeSchemas.js";
import Token from "../models/TokenSchemas.js";
import registerTemplate from "../templates_mail/registerTemplate.js";
import resendTemplate from "../templates_mail/resendTemplate.js";
import resetTemplate from "../templates_mail/resetTemplate.js";
import sendResponse from "../helper/sendResponse.helper.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import firebase from "firebase-admin";
import serviceAccount from "../conf/key/firebase.json" with { type: "json" };
import { uploadFile } from "./uploadService.js";

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

const getHashedPassword = (password) => {
  return bcrypt.hashSync(password, 8);
};

const verifyPassword = async (plain_password, hashed_password) => {
  return bcrypt.compare(plain_password, hashed_password);
};

const generateToken = async (tokenData, secretKey, expiresIn) => {
  return jwt.sign(tokenData, secretKey, { expiresIn });
};

const createTokenPair = async (res, user) => {
  const tokenData = { _id: user._id, email: user.email };

  const accessToken = await generateToken(
    tokenData,
    process.env.JWT_SECRET,
    "1y"
  );

  const refreshToken = await generateToken(
    tokenData,
    process.env.JWT_REFRESH_SECRET,
    "1y"
  );

  try {
    await Token.findOneAndDelete({ userId: user._id });

    await Token.create({
      userId: user._id,
      refreshToken: refreshToken,
    });

    return sendResponse({
      res,
      status: 200,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error("Error saving token:", error);
    return res
      .status(500)
      .json({ status: false, error: "Internal Server Error" });
  }
};

const createCode = async () => {
  let digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
};

const createTag = async () => {
  let digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
};
const sendEmail = (res, email, code, type) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  if (type == "register") {
    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Welcome to Syncify!",
      html: registerTemplate(code),
    };
  } else if (type == "resend") {
    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Here your new code!",
      html: resendTemplate(code),
    };
  } else {
    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Code for Reset Password",
      html: resetTemplate(code),
    };
  }
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return res.status(500).send("Error sending email");
    }
  });
};

const createOrUpdateCode = async (email, password, username, code) => {
  const expireCode = new Date();
  expireCode.setMinutes(expireCode.getMinutes() + 1);
  const checkCode = await Code.findOne({ email: email });
  if (checkCode) {
    if (password && username) {
      await Code.findByIdAndUpdate(checkCode._id, {
        code: code,
        password: getHashedPassword(password),
        username: username,
        expiredAt: expireCode,
      });
    } else {
      await Code.findByIdAndUpdate(checkCode._id, {
        code: code,
        expiredAt: expireCode,
      });
    }
    await Code.findByIdAndUpdate(checkCode._id, {
      code: code,
      expiredAt: expireCode,
    });
  } else {
    if (password && username) {
      var codeData = {
        email: email,
        password: getHashedPassword(password),
        username: username,
        code: code,
        expiredAt: expireCode,
      };
    } else {
      var codeData = {
        email: email,
        code: code,
        expiredAt: expireCode,
      };
    }
    const newCode = new Code(codeData);
    await newCode.save();
  }
};

const handleRegister = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      return sendResponse({
        res,
        status: 400,
        message: "User already exists",
      });
    }

    const code = await createCode();

    await createOrUpdateCode(
      req.body.email,
      req.body.password,
      req.body.username,
      code
    );

    sendEmail(res, req.body.email, code, "register");

    return sendResponse({ res, status: 200, message: "Register success" });
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleVerifyCode = async (code, email, res) => {
  try {
    const checkCode = await Code.findOne({ email, code });

    if (!checkCode) {
      return sendResponse({
        res,
        status: 400,
        message: "Code is wrong or expired",
      });
    }

    if (checkCode.expiredAt < new Date()) {
      return sendResponse({
        res,
        status: 400,
        message: "Code is expired",
      });
    }

    const user = await User.findOne({ email: email });
    const userTag = await createTag();

    if (user) {
      await Code.findByIdAndDelete(checkCode._id);
      return await createTokenPair(res, user);
    }

    const newUser = new User({
      email: checkCode.email,
      password: checkCode.password,
      username: checkCode.username,
      tag: userTag,
    });

    await newUser.save();
    await Code.findByIdAndDelete(checkCode._id);
    return await createTokenPair(res, newUser);
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendResponse({ res, status: 400, message: error.message });
    }
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleResendCode = async (email, res) => {
  try {
    const code = await createCode();
    await createOrUpdateCode(email, null, null, code);
    sendEmail(res, email, code, "resend");
    return sendResponse({ res, status: 200, message: "Resend code success" });
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleLogin = async (email, password, res) => {
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return sendResponse({ res, status: 401, message: "Unauthorized" });
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return sendResponse({ res, status: 401, message: "Unauthorized" });
    }

    return await createTokenPair(res, user);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleRefreshToken = async (refreshToken, res) => {
  if (!refreshToken) {
    return sendResponse({
      res,
      status: 400,
      message: "Refresh token is required",
    });
  }

  try {
    const tokenRecord = await Token.findOne({ refreshToken });

    if (!tokenRecord) {
      return res
        .status(401)
        .json({ status: false, error: "Invalid refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const { exp } = jwt.decode(refreshToken);

    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = exp - currentTime;

    if (remainingTime <= 0) {
      return res
        .status(401)
        .json({ status: false, error: "Refresh token expired" });
    }

    const newAccessToken = await generateToken(
      { _id: decoded._id, email: decoded.email },
      process.env.JWT_SECRET,
      "1h"
    );

    const newRefreshToken = await generateToken(
      { _id: decoded._id, email: decoded.email },
      process.env.JWT_REFRESH_SECRET,
      remainingTime
    );

    tokenRecord.refreshToken = newRefreshToken;
    await tokenRecord.save();

    return sendResponse({
      res,
      status: 200,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res
      .status(401)
      .json({ status: false, error: "Invalid or expired refresh token" });
  }
};

const handleSendCode = async (email, res) => {
  try {
    if (!email) {
      return sendResponse({ res, status: 400, message: "Email is required" });
    }

    const checkEmail = await User.findOne({ email: email });

    if (!checkEmail) {
      return sendResponse({ res, status: 400, message: "Email not found" });
    }

    const code = await createCode();

    await createOrUpdateCode(email, null, null, code);
    sendEmail(res, email, code, "reset");

    return sendResponse({ res, status: 200, message: "Send code success" });
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleResetPassword = async (userId, password, res) => {
  try {
    const checkUser = await User.findById(userId);

    if (!checkUser) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
      });
    }

    checkUser.password = getHashedPassword(password);
    await checkUser.save();
    return sendResponse({
      res,
      status: 200,
      message: "Reset password success",
    });
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleGoogleLogin = async (accessToken, res) => {
  try {
    const decodedToken = await firebase.auth().verifyIdToken(accessToken);
    const { email, name, picture } = decodedToken;
    const user = await User.findOne({ email: email });

    if (user) {
      return await createTokenPair(res, user);
    }

    const newUser = new User({
      email: email,
      tag: await createTag(),
      username: name,
      avatar: picture,
      isGoogle: true,
    });

    await newUser.save();

    return await createTokenPair(res, newUser);
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendResponse({ res, status: 400, message: error.message });
    }
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleUpdateProfile = async (userId, updatedData, res) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return sendResponse({ res, status: 404, message: "User not found" });
    }

    const existingUsernameAndTag = await User.findOne({
      displayName: updatedData.displayName || user.displayName,
      tag: updatedData.tag || user.tag,
      _id: { $ne: userId },
    });

    if (existingUsernameAndTag) {
      return sendResponse({
        res,
        status: 400,
        message: "Display name or tag already exists",
      });
    }

    Object.keys(updatedData).forEach((update) => {
      user[update] = updatedData[update];
    });

    await user.save();

    return sendResponse({ res, status: 200, message: "Update success" });
  } catch (error) {
    if (error.name === "ValidationError") {
      return sendResponse({ res, status: 400, message: error.message });
    }
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleUploadFile = async (userId, imagePath, type, folderName, res) => {
  try {
    const checkUser = await User.findById(userId);
    if (!checkUser) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
      });
    }
    if (imagePath) {
      const upload = await uploadFile(imagePath, type, folderName);

      return sendResponse({ res, status: 200, data: upload });
    } else {
      return sendResponse({
        res,
        status: 400,
        message: "Image path not valid",
      });
    }
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message });
  }
};
export {
  handleRegister,
  handleVerifyCode,
  handleResendCode,
  handleLogin,
  handleRefreshToken,
  handleSendCode,
  handleResetPassword,
  handleGoogleLogin,
  handleUpdateProfile,
  handleUploadFile,
};
