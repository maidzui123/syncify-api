import Notification from "../models/NotificationSchemas.js";
import { User } from "../models/UserSchemas.js";
import { ERROR } from "../constants/error.js";
import sendResponse from "../helper/sendResponse.helper.js";

const handleGetUserListNotifications = async (userId, cursor, limit, res) => {
  try {
    const checkUser = await User.findById(userId);

    if (!checkUser) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }

    const query = { userId: userId, isDeleted: false };

    if (cursor) {
      query["_id"] = { $lt: cursor };
    }

    const notifications = await Notification.find(query)
      .select("-isDeleted -__v -updatedAt -userId")
      .limit(limit)
      .sort({ createdAt: -1 });

    const nextCursor =
      notifications.length == limit
        ? notifications[notifications.length - 1]._id
        : null;

    return sendResponse({
      res,
      status: 200,
      data: { notifications, nextCursor },
    });
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

const handleSendNotification = async (senderId, receiverId, type) => {
  try {
    const checkSender = await User.findById(senderId);
    const checkReceiver = await User.findById(receiverId);

    if (!checkSender || !checkReceiver) {
      return false;
    }

    const payload = {
      type: type,
      userId: receiverId,
      username: checkSender.username,
      avatar: checkSender.avatar,
      sentAt: new Date(),
    };

    const notification = new Notification({
      userId: receiverId,
      payload: JSON.stringify(payload),
      type: type,
    });

    await notification.save();

    return payload;
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

const handleMarkNotificationAsRead = async (userId, notificationId, res) => {
  try {
    const checkUser = await User.findById(userId);

    if (!checkUser) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return sendResponse({
        res,
        status: 404,
        message: "Notification not found",
        errorCode: ERROR.NOTI_NOT_FOUND,
      });
    }

    if (notification.userId.toString() !== userId) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }

    notification.isRead = true;
    
    await notification.save();

    return sendResponse({
      res,
      status: 200,
      data: { success: true, message: "Marked as read" },
    });
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

export {
  handleGetUserListNotifications,
  handleSendNotification,
  handleMarkNotificationAsRead,
};
