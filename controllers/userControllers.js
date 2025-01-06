import sendResponse from "../helper/sendResponse.helper.js";
import * as userServices from "../services/userServices.js";
import { ERROR } from "../constants/error.js";

const userControllers = {};

// Get My Profile
userControllers.getMyProfile = async (req, res) => {
  try {
    const userId = req.user;
    return await userServices.handleGetMyProfile(userId, res);
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

// Get User Profile
userControllers.getUserProfile = async (req, res) => {
  try {
    const userId = req.user;
    const otherUserId = req.params.userId;
    return await userServices.handleGetUserProfile(userId, otherUserId, res);
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

// Get List Friends
userControllers.getListFriends = async (req, res) => {
  try {
    const userId = req.user;
    const cursor = req.query.cursor;
    const limit = req.query.limit;
    return await userServices.handleGetListFriends(userId, cursor, limit, res);
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

// Get List Friends Request
userControllers.getListFriendsRequest = async (req, res) => {
  try {
    const userId = req.user;
    const type = req.query.type;
    const scope = req.query.scope;
    const cursor = req.query.cursor;
    const limit = req.query.limit;
    return await userServices.handleGetListFriendsRequest(
      userId,
      type,
      scope,
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

// Send friend request
userControllers.sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user;
    const { friendId } = req.body;

    return await userServices.handleSendFriendRequest(userId, friendId, res);
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

// Accept friend request
userControllers.acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user;
    const { frRequestId } = req.body;

    return await userServices.handleAcceptFriendRequest(
      userId,
      frRequestId,
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

// Reject friend request
userControllers.rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user;
    const { frRequestId } = req.body;

    return await userServices.handleRejectFriendRequest(
      userId,
      frRequestId,
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

// Unfriend
userControllers.unfriend = async (req, res) => {
  try {
    const userId = req.user;
    const { friendId } = req.body;

    return await userServices.handleUnfriend(userId, friendId, res);
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

// Search User
userControllers.searchUser = async (req, res) => {
  try {
    const userId = req.user;
    const { username, tag } = req.body;

    return await userServices.handleSearchUser(userId, username, tag, res);
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};
export default userControllers;
