import sendResponse from "../helper/sendResponse.helper.js";
import * as postServices from "../services/postServices.js";
import { ERROR } from "../constants/error.js";
const postControllers = {};

// Create New Post
postControllers.createPost = async (req, res) => {
  try {
    const userId = req.user;
    const { content, media, privacy } = req.body;

    return await postServices.handleCreatePost(
      userId,
      content,
      media,
      privacy,
      res
    );
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Comment Post
postControllers.commentPost = async (req, res) => {
  try {
    const userId = req.user;
    const { postId, content } = req.body;

    return await postServices.handleCommentPost(userId, postId, content, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Like/Unlike Post
postControllers.interactPost = async (req, res) => {
  try {
    const userId = req.user;
    const { postId, isLike } = req.body;

    return await postServices.handleInteractPost(userId, postId, isLike, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Share Post
postControllers.sharePost = async (req, res) => {
  try {
    const userId = req.user;
    const { postId } = req.body;

    return await postServices.handleSharePost(userId, postId, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
}

// Reply comment
postControllers.replyComment = async (req, res) => {
  try {
    const userId = req.user;
    const { commentId, content } = req.body;

    return await postServices.handleReplyComment(
      userId,
      commentId,
      content,
      res
    );
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Archive Post
postControllers.archivePost = async (req, res) => {
  try {
    const userId = req.user;
    const { postId } = req.body;

    return await postServices.handleArchivePost(userId, postId, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Delete Post
postControllers.deletePost = async (req, res) => {
  try {
    const userId = req.user;
    const postId = req.params.postId;

    return await postServices.handleDeletePost(userId, postId, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Update Post
postControllers.updatePost = async (req, res) => {
  try {
    const userId = req.user;
    const postId  = req.params.postId;

    if (!postId) {
      return sendResponse({
        res,
        status: 400,
        message: "Post id is required",
      });
    }

    const allowedUpdates = ["content", "media", "privacy"];

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

    return await postServices.handleUpdatePost(userId, postId, req.body, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Update comment
postControllers.updateComment = async (req, res) => {
  try {
    const userId = req.user;
    const commentId = req.params.commentId;

    if (!commentId) {
      return sendResponse({
        res,
        status: 400,
        message: "Comment id is required",
      });
    }

    const allowedUpdates = ["content"];

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

    return await postServices.handleUpdateComment(
      userId,
      commentId,
      req.body,
      res
    );
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// Update reply
postControllers.updateReply = async (req, res) => {
  try {
    const userId = req.user;
    const commentId= req.params.commentId;
    const replyId = req.params.replyId;

    if (!replyId) {
      return sendResponse({
        res,
        status: 400,
        message: "Reply id is required",
      });
    }

    const allowedUpdates = ["content"];

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

    return await postServices.handleUpdateReply(
      userId,
      commentId,
      replyId,
      req.body,
      res
    );
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// User's List Posts
postControllers.getUserListPosts = async (req, res) => {
  try {
    const userId = req.user;
    const cursor = req.query.cursor;
    const limit = req.query.limit;
    return await postServices.handleGetUserListPosts(userId, cursor, limit, res);
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};

// User's List Archived Posts
postControllers.getUserListArchivedPosts = async (req, res) => {
  try {
    const userId = req.user;
    const cursor = req.query.cursor;
    const limit = req.query.limit;
    return await postServices.handleGetUserListArchivedPosts(
      userId,
      cursor,
      limit,
      res
    );
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message, errorCode: ERROR.SERVER_ERROR });
  }
};
export default postControllers;
