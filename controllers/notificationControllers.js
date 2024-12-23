import sendResponse from "../helper/sendResponse.helper.js";
import * as notificationServices from "../services/notificationServices.js";
const notificationControllers = {};

// User's List Notifications
notificationControllers.getUserListNotifications = async (req, res) => {
  try {
    const userId = req.user;
    const cursor = req.query.cursor;
    const limit = req.query.limit;
    return await notificationServices.handleGetUserListNotifications(userId, cursor, limit, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message });
  }
};

export default notificationControllers;
