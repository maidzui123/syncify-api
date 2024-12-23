import Notification from "../models/NotificationSchemas.js";

const handleGetUserListNotifications = async (userId, cursor, limit, res) => {
  try {
    return sendResponse({
      res,
      status: 200,
      message: "Success",
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

export { handleGetUserListNotifications };
