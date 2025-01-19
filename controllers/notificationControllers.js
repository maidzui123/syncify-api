import sendResponse from "../helper/sendResponse.helper.js";
import * as notificationServices from "../services/notificationServices.js";
const notificationControllers = {};

// User's List Notifications
notificationControllers.getUserListNotifications = async (req, res) => {
  try {
    const userId = req.user;
    const cursor = req.query.cursor;
    const limit = req.query.limit || 10;
    return await notificationServices.handleGetUserListNotifications(userId, cursor, limit, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message });
  }
};

// Mark Notification as Read
notificationControllers.markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user;
    const notificationId = req.body.notificationId;
    return await notificationServices.handleMarkNotificationAsRead(userId, notificationId, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message });
  }
};

export default notificationControllers;

