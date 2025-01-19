import { User } from "../models/UserSchemas.js";
import Chat from "../models/ChatSchemas.js";
import Message from "../models/MesssageSchemas.js";
import sendResponse from "../helper/sendResponse.helper.js";
import { ERROR } from "../constants/error.js";
import { sendMessageChat } from "../sockets/socketHandler.js";
const handleCreateChat = async (userId, otherUserId, res) => {
  try {
    const checkUser = await User.findById(userId);
    const checkOtherUser = await User.findById(otherUserId);

    if (!checkUser) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }

    if (!checkOtherUser) {
      return sendResponse({
        res,
        status: 404,
        message: "User not found",
        errorCode: ERROR.USER_NOT_FOUND,
      });
    }

    const checkChat = await Chat.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (checkChat) {
      return sendResponse({
        res,
        status: 200,
        message: "Join chat successfully",
        chat: checkChat,
      });
    }

    const newChat = new Chat({
      participants: [userId, otherUserId],
    });

    await newChat.save();

    return sendResponse({
      res,
      status: 200,
      message: "Join chat successfully",
      chat: newChat,
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

const handleSendMessage = async (
  userId,
  chatId,
  message,
  type,
  socketId,
  res
) => {
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

    const checkChat = await Chat.findById(chatId);

    if (!checkChat) {
      return sendResponse({
        res,
        status: 404,
        message: "Chat not found",
        errorCode: ERROR.CHAT_NOT_FOUND,
      });
    }

    if (checkChat.participants.indexOf(userId) === -1) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }

    const receiverId = checkChat.participants.find(
      (participant) => participant.toString() !== userId.toString()
    );

    const newMessage = new Message({
      chatId,
      senderId: userId,
      receiverId,
      type: type,
      content: message,
    });

    await newMessage.save();

    await sendMessageChat(chatId, socketId, message);

    return sendResponse({
      res,
      status: 200,
      message: "Send message successfully",
      content: newMessage,
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

const handleGetAllChats = async (userId, cursor, limit, res) => {
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

    const chatsWithMessages = await Message.distinct("chatId");

    const query = cursor
      ? { participants: userId, _id: { $lt: cursor, $in: chatsWithMessages } }
      : { participants: userId, _id: { $in: chatsWithMessages } };

    const chats = await Chat.find(query)
      .populate("participants", "username avatar")
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const formattedChats = [];
    for (const chat of chats) {
      const lastMessage = await Message.findOne({ chatId: chat._id })
        .sort({ createdAt: -1 })
        .lean();

      if (lastMessage) {
        const otherParticipant = chat.participants.find(
          (participant) => participant._id.toString() !== userId
        );

        formattedChats.push({
          chatId: chat._id,
          lastMessage: {
            content: lastMessage.content,
            senderId: lastMessage.senderId,
            createdAt: lastMessage.createdAt,
          },
          otherParticipant: otherParticipant
            ? {
                username: otherParticipant.username,
                avatar: otherParticipant.avatar,
              }
            : null,
        });
      }
    }

    const nextCursor =
      formattedChats.length == limit
        ? formattedChats[formattedChats.length - 1].chatId
        : null;

    return sendResponse({
      res,
      status: 200,
      data: { chats: formattedChats, nextCursor },
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

const handleGetAllMessages = async (userId, chatId, cursor, limit, res) => {
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

    const checkChat = await Chat.findById(chatId);

    if (!checkChat) {
      return sendResponse({
        res,
        status: 404,
        message: "Chat not found",
        errorCode: ERROR.CHAT_NOT_FOUND,
      });
    }

    const query = cursor
      ? { chatId: chatId, _id: { $lt: cursor } }
      : { chatId: chatId };

    const messages = await Message.find(query)
      .select(" -__v")
      .populate({ path: "senderId", select: "username avatar" })
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const formattedMessages = messages.map((message) => ({
      ...message,
      isSender: message.senderId._id == userId,
    }));

    const nextCursor =
      formattedMessages.length == limit ? formattedMessages[0]._id : null;

    return sendResponse({
      res,
      status: 200,
      data: { messages: formattedMessages, nextCursor },
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

// const handleDeleteChat = async (req, res) => {
//   try {
//     return;
//   } catch (error) {
//     return sendResponse({
//       res,
//       status: 500,
//       message: error.message,
//       errorCode: ERROR.SERVER_ERROR,
//     });
//   }
// };
export {
  handleCreateChat,
  handleSendMessage,
  handleGetAllChats,
  handleGetAllMessages,
  // handleDeleteChat,
};
