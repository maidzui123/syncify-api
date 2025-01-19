import sendResponse from "../helper/sendResponse.helper.js";
import * as chatServices from "../services/chatServices.js";
import { ERROR } from "../constants/error.js";

const chatControllers = {};

chatControllers.createChat = async (req, res) => {
  try {
    const userId = req.user;
    const { otherUserId } = req.body;
    return await chatServices.handleCreateChat(userId, otherUserId, res);
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

chatControllers.sendMessage = async (req, res) => {
  try {
    const userId = req.user;
    const { chatId, message, type, socketId } = req.body;
    return await chatServices.handleSendMessage(
      userId,
      chatId,
      message,
      type,
      socketId,
      res
    );
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

chatControllers.getAllChats = async (req, res) => {
  try {
    const userId = req.user;
    const cursor = req.query.cursor;
    const limit = req.query.limit || 10;
    return await chatServices.handleGetAllChats(userId, cursor, limit, res);
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

chatControllers.getAllMessages = async (req, res) => {
  try {
    const userId = req.user;
    const chatId = req.params.chatId;
    const cursor = req.query.cursor;
    const limit = req.query.limit || 10;
    return await chatServices.handleGetAllMessages(
      userId,
      chatId,
      cursor,
      limit,
      res
    );
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

// chatControllers.deleteChat = async (req, res) => {
//   try {
//     return await chatServices.handleDeleteChat(req, res);
//   } catch (error) {
//     return sendResponse({
//       res,
//       status: 500,
//       message: error.message,
//       errorCode: ERROR.SERVER_ERROR,
//     });
//   }
// };

export default chatControllers;
