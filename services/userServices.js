import { User } from "../models/UserSchemas.js";
import FriendRequest from "../models/FriendRequestSchemas.js";
import sendResponse from "../helper/sendResponse.helper.js";
import { sendNotification } from "../sockets/socketHandler.js";
import { ERROR } from "../constants/error.js";

const handleUpdateStatus = async (userId, status) => {
  try {
    const checkUser = await User.findById(userId);

    if (!checkUser) {
      return false;
    }

    checkUser.isOnline = status;
    await checkUser.save();

    return checkUser.friends;
  } catch {
    return false;
  }
};

const getListFriendsAll = async (userId) => {
  try {
    const listFriends = await User.findById(userId)
      .populate({
        path: "friends",
        select: "_id",
      })
      .then((user) => user.friends.map((friend) => friend));

    return listFriends;
  } catch {
    return [];
  }
};

const handleGetMyProfile = async (userId, res) => {
  try {
    const checkUser = await User.findById(userId).select(
      "-friends -password -__v -createdAt -updatedAt -isGoogle -isAdmin"
    );
    if (!checkUser) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }
    return sendResponse({ res, status: 200, data: checkUser });
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

const handleGetUserProfile = async (userId, otherUserId, res) => {
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

    const checkOtherUser = await User.findById(otherUserId).select(
      "-friends -password -__v -createdAt -updatedAt -isGoogle -isAdmin"
    );

    if (!checkUser) {
      return sendResponse({
        res,
        status: 404,
        message: "User not found",
        errorCode: ERROR.USER_NOT_FOUND,
      });
    }

    return sendResponse({ res, status: 200, data: checkOtherUser });
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

const handleGetListFriends = async (userId, cursor, limit, res) => {
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

    const query = { _id: { $in: checkUser.friends } };

    if (cursor) {
      query._id.$gt = cursor;
    }

    const friends = await User.find(query)
      .select("email username avatar tag isOnline")
      .sort({ _id: 1 })
      .limit(limit);

    const nextCursor =
      friends.length == limit ? friends[friends.length - 1]._id : null;

    return sendResponse({
      res,
      status: 200,
      data: {
        friends,
        nextCursor,
      },
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

const handleGetListFriendsRequest = async (
  userId,
  type,
  scope,
  cursor,
  limit,
  res
) => {
  try {
    let friendsRequest = [];
    let query = {};

    const checkUser = await User.findById(userId);

    if (!checkUser) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }

    if (scope === "other") {
      query = { fromUserId: userId, status: type };

      if (cursor) {
        query["_id"] = { $gt: cursor };
      }

      friendsRequest = await FriendRequest.find(query)
        .populate({
          path: "toUserId",
          select: "email username avatar tag isOnline",
        })
        .select("fromUserId")
        .sort({ _id: 1 })
        .limit(limit);
    } else if (scope === "me") {
      query = { toUserId: userId, status: type };

      if (cursor) {
        query["_id"] = { $gt: cursor };
      }

      friendsRequest = await FriendRequest.find(query)
        .populate({
          path: "fromUserId",
          select: "email username avatar tag isOnline",
        })
        .select("toUserId")
        .sort({ _id: 1 })
        .limit(limit);
    } else {
      return sendResponse({
        res,
        status: 400,
        message: "Invalid scope",
        errorCode: ERROR.SCOPE_INVALID,
      });
    }

    const nextCursor =
      friendsRequest.length == limit
        ? friendsRequest[friendsRequest.length - 1]._id
        : null;

    return sendResponse({
      res,
      status: 200,
      data: {
        friendsRequest,
        nextCursor,
      },
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

const handleSendFriendRequest = async (userId, friendId, res) => {
  try {
    if (userId === friendId) {
      return sendResponse({
        res,
        status: 400,
        message: "You can't send friend request to yourself",
        errorCode: ERROR.SEND_REQ_TO_SELF,
      });
    }
    
    const user = await User.findById(userId);

    if (!user) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }

    const friend = await User.findById(friendId);

    if (!friend) {
      return sendResponse({ res, status: 404, message: "Friend not found" });
    }

    if (user.friends.includes(friendId)) {
      return sendResponse({
        res,
        status: 400,
        message: "You are already friends with this user",
        errorCode: ERROR.FRIEND_ALREADY,
      });
    }

    const friendRequest = await FriendRequest.findOne({
      fromUserId: userId,
      toUserId: friendId,
      status: "pending",
    });

    if (friendRequest) {
      return sendResponse({
        res,
        status: 400,
        message: "You have already sent a friend request to this user",
        errorCode: ERROR.FRIEND_REQ_ALREADY,
      });
    }

    const newFriendRequest = new FriendRequest({
      fromUserId: userId,
      toUserId: friendId,
    });

    await newFriendRequest.save();
    await sendNotification(userId, friendId, "friendRequest");

    return sendResponse({ res, status: 200, message: "Friend request sent" });
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

const handleAcceptFriendRequest = async (userId, frRequestId, res) => {
  try {
    const toUser = await User.findById(userId);
    if (!toUser) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }

    const friendRequest = await FriendRequest.findById(frRequestId);

    if (!friendRequest) {
      return sendResponse({
        res,
        status: 404,
        message: "Friend request not found",
        errorCode: ERROR.FRIEND_REQ_NOT_FOUND,
      });
    }

    if (friendRequest.toUserId.toString() !== userId) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }

    if (friendRequest.status !== "pending") {
      return sendResponse({
        res,
        status: 400,
        message: "Friend request is not pending",
        errorCode: ERROR.FRIEND_REQ_NOT_PENDING,
      });
    }

    if (toUser.friends.includes(friendRequest.fromUserId)) {
      return sendResponse({
        res,
        status: 400,
        message: "You are already friends with this user",
        errorCode: ERROR.FRIEND_ALREADY,
      });
    }

    const fromUser = await User.findById(friendRequest.fromUserId);

    if (!fromUser) {
      return sendResponse({
        res,
        status: 404,
        message: "User not found",
        errorCode: ERROR.USER_NOT_FOUND,
      });
    }

    toUser.friends.push(friendRequest.fromUserId);
    await toUser.save();

    fromUser.friends.push(friendRequest.toUserId);
    await fromUser.save();

    friendRequest.status = "accepted";
    await friendRequest.save();

    await sendNotification(
      userId,
      friendRequest.fromUserId,
      "acceptFriendRequest"
    );

    return sendResponse({
      res,
      status: 200,
      message: "Friend request accepted",
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

const handleRejectFriendRequest = async (userId, frRequestId, res) => {
  try {
    const toUser = await User.findById(userId);
    if (!toUser) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }

    const friendRequest = await FriendRequest.findById(frRequestId);

    if (!friendRequest) {
      return sendResponse({
        res,
        status: 404,
        message: "Friend request not found",
        errorCode: ERROR.FRIEND_REQ_NOT_FOUND,
      });
    }

    if (friendRequest.toUserId.toString() !== userId) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }

    if (friendRequest.status !== "pending") {
      return sendResponse({
        res,
        status: 400,
        message: "Friend request is not pending",
        errorCode: ERROR.FRIEND_REQ_NOT_PENDING,
      });
    }

    friendRequest.status = "rejected";
    await friendRequest.save();

    return sendResponse({
      res,
      status: 200,
      message: "Friend request rejected",
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

const handleUnfriend = async (userId, friendId, res) => {
  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }

    if (!friend) {
      return sendResponse({
        res,
        status: 404,
        message: "User not found",
        errorCode: ERROR.USER_NOT_FOUND,
      });
    }

    if (!user.friends.includes(friendId)) {
      return sendResponse({
        res,
        status: 400,
        message: "You are not friends with this user",
        errorCode: ERROR.FRIEND_NOT_EXIST,
      });
    }

    await User.findByIdAndUpdate(
      userId,
      { $pull: { friends: friendId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      friendId,
      { $pull: { friends: userId } },
      { new: true }
    );

    return sendResponse({ res, status: 200, message: "Unfriend successful" });
  } catch (error) {
    return sendResponse({
      res,
      status: 500,
      message: error.message,
      errorCode: ERROR.SERVER_ERROR,
    });
  }
};

const handleSearchUser = async (userId, username, tag, res) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }

    const searchUser = await User.findOne({ username, tag }).select(
      "email username avatar tag isOnline"
    );

    if (!searchUser) {
      return sendResponse({
        res,
        status: 404,
        message: "User not found",
        errorCode: ERROR.USER_NOT_FOUND,
      });
    }

    return sendResponse({ res, status: 200, data: searchUser });
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
  handleGetMyProfile,
  handleGetUserProfile,
  handleUpdateStatus,
  getListFriendsAll,
  handleGetListFriends,
  handleGetListFriendsRequest,
  handleSendFriendRequest,
  handleAcceptFriendRequest,
  handleRejectFriendRequest,
  handleUnfriend,
  handleSearchUser,
};
