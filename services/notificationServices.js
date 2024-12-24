import Notification from "../models/NotificationSchemas.js";
import {User} from "../models/UserSchemas.js";
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

const handleNotifyFriendRequest = async (senderId, receiverId) => {
  try {
    const checkSender = await User.findById(senderId);
    const checkReceiver = await User.findById(receiverId);

    if (!checkSender || !checkReceiver) {
      return false;
    }

    const payload = {
      "type": "friendRequest",
      "userId": receiverId,
      "username": checkSender.username,
      "avatar": checkSender.avatar,
      "sentAt": new Date(),
    }

    const notification = new Notification({
      userId: receiverId,
      payload: JSON.stringify(payload),
      type: "friendRequest",
    });

    await notification.save();
    
    return payload;
  } catch (error) {
    throw new Error(error.message);
  }
}

export { handleGetUserListNotifications, handleNotifyFriendRequest };
