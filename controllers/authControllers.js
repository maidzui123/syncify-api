import sendResponse from "../helper/sendResponse.helper.js";
import * as authServices from "../services/authServices.js";
import compressVideo from "../middleware/compress.js";
import fs from "fs";
const authControllers = {};
import { ERROR } from "../constants/error.js";
// Register
authControllers.register = async (req, res) => {
  try {
    return await authServices.handleRegister(req, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Verify Code (Register)
authControllers.verifyCode = async (req, res) => {
  try {
    const { code, email } = req.body;
    return await authServices.handleVerifyCode(code, email, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Resend Code
authControllers.resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    return await authServices.handleResendCode(email, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Login
authControllers.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    return await authServices.handleLogin(email, password, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Refresh Token
authControllers.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    return await authServices.handleRefreshToken(refreshToken, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Send Code (For Reset Password)
authControllers.sendCode = async (req, res) => {
  try {
    const { email } = req.body;
    return await authServices.handleSendCode(email, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Reset Password
authControllers.resetPassword = async (req, res) => {
  try {
    const userId = req.user;
    const { password } = req.body;
    return await authServices.handleResetPassword(userId, password, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Login with Google
authControllers.googleLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;
    return await authServices.handleGoogleLogin(accessToken, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Update profile
authControllers.updateProfile = async (req, res) => {
  try {
    const userId = req.user;
    const allowedUpdates = [
      "avatar",
      "username",
      "displayName",
      "tag",
      "gender",
      "dob",
      "country",
      "tel",
    ];
    const updatedData = Object.keys(req.body);

    const isUpdateAllowed = updatedData.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isUpdateAllowed) {
      return sendResponse({
        res,
        status: 400,
        message: "Invalid fields in request",
      });
    }

    return await authServices.handleUpdateProfile(userId, req.body, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Upload image
authControllers.uploadFile = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return sendResponse({
        res,
        status: 400,
        message: req.fileValidationError,
      });
    }

    if (!req.file) {
      return sendResponse({
        res,
        status: 400,
        message: "No file uploaded or invalid file format",
      });
    }

    const userId = req.user;
    const filePath = req.file.path;
    const { type, folderName } = req.body;

    try {
      if (type === "video") {
        const compressedPath = await compressVideo(filePath, "./uploads");
        fs.unlinkSync(filePath); 
        req.file.path = compressedPath; 
      }

      const result = await authServices.handleUploadFile(
        userId,
        req.file.path,
        type,
        folderName,
        res
      );

      fs.unlinkSync(req.file.path);

      return result;
    } catch (processingError) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return sendResponse({
        res,
        status: 500,
        message: processingError.message,
      });
    }
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};
export default authControllers;
