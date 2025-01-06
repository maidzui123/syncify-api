import { User } from "../models/UserSchemas.js";
import { Post } from "../models/PostSchemas.js";
import { Comment } from "../models/CommentSchemas.js";
import sendResponse from "../helper/sendResponse.helper.js";
import { sendNotification } from "../sockets/socketHandler.js";
import { ERROR } from "../constants/error.js";

const handleCreatePost = async (userId, content, media, privacy, res) => {
  try {
    const user = User.findById(userId);

    if (!user) {
      return sendResponse({
        res,
        status: 401,
        message: "Access Denied",
        errorCode: ERROR.ACCESS_DENIED,
      });
    }

    if (media.length > 5) {
      return sendResponse({
        res,
        status: 400,
        message: "Media maximum limit is 5",
        errorCode: ERROR.MEDIA_MAX_LIMIT,
      });
    }

    if (content === "") {
      return sendResponse({
        res,
        status: 400,
        message: "Content is required",
        errorCode: ERROR.CONTENT_REQUIRED,
      });
    }
    const videoCount = media.filter((item) => item.type === "video").length;

    if (videoCount > 2) {
      return sendResponse({
        res,
        status: 400,
        message: "Video maximum limit is 2",
        errorCode: ERROR.VIDEO_MAX_LIMIT,
      });
    }

    const post = await Post.create({
      createdBy: userId,
      content,
      media,
      privacy,
    });

    return sendResponse({
      res,
      status: 200,
      message: "Post created successfully",
      data: post,
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

const handleCommentPost = async (userId, postId, content, res) => {
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

    const post = await Post.findById(postId);

    if (!post) {
      return sendResponse({
        res,
        status: 404,
        message: "Post not found",
        errorCode: ERROR.POST_NOT_FOUND,
      });
    }

    const comment = await Comment.create({
      createdBy: userId,
      content,
    });

    post.comments.push(comment);
    await post.save();

    if (post.createdBy != userId) {
      await sendNotification(userId, post.createdBy, "comment");
    }

    return sendResponse({
      res,
      status: 200,
      message: "Comment created successfully",
      data: comment,
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

const handleInteractPost = async (userId, postId, isLike, res) => {
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

    const post = await Post.findById(postId);

    if (!post) {
      return sendResponse({
        res,
        status: 404,
        message: "Post not found",
        errorCode: ERROR.POST_NOT_FOUND,
      });
    }

    if (isLike) {
      if (post.likes.includes(userId)) {
        return sendResponse({
          res,
          status: 400,
          message: "You have already liked this post",
          errorCode: ERROR.LIKE_POST_ALREADY,
        });
      }

      post.likes.push(userId);
      if (post.createdBy != userId) {
        await sendNotification(userId, post.createdBy, "like");
      }
    } else {
      if (!post.likes.includes(userId)) {
        return sendResponse({
          res,
          status: 400,
          message: "You have not liked this post",
          errorCode: ERROR.NOT_LIKE_POST_EXIST,
        });
      }
      post.likes.pop(userId);
    }

    await post.save();

    return sendResponse({
      res,
      status: 200,
      message: isLike ? "Post liked successfully" : "Post unliked successfully",
      data: post,
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

const handleSharePost = async (userId, postId, res) => {
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

    const post = await Post.findById(postId);

    if (!post) {
      return sendResponse({
        res,
        status: 404,
        message: "Post not found",
        errorCode: ERROR.POST_NOT_FOUND,
      });
    }

    if (post.shares.includes(userId)) {
      return sendResponse({
        res,
        status: 400,
        message: "You have already shared this post",
        errorCode: ERROR.SHARE_POST_ALREADY,
      });
    }

    post.shares.push(userId);
    await post.save();

    if (post.createdBy != userId) {
      await sendNotification(userId, post.createdBy, "share");
    }

    return sendResponse({
      res,
      status: 200,
      message: "Post shared successfully",
      data: post,
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

const handleReplyComment = async (userId, commentId, content, res) => {
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

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return sendResponse({
        res,
        status: 404,
        message: "Comment not found",
        errorCode: ERROR.COMMENT_NOT_FOUND,
      });
    }

    comment.replies.push({ user: userId, content });

    comment.save();

    if (comment.createdBy != userId) {
      await sendNotification(userId, comment.createdBy, "replyComment");
    }

    return sendResponse({
      res,
      status: 200,
      message: "Reply comment successfully",
      data: comment,
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

const handleArchivePost = async (userId, postId, res) => {
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
    const user = await User.findById(userId);

    const post = await Post.findById(postId);

    if (!post) {
      return sendResponse({
        res,
        status: 404,
        message: "Post not found",
        errorCode: ERROR.POST_NOT_FOUND,
      });
    }

    if (post.createdBy != userId || user.isAdmin == false) {
      return sendResponse({
        res,
        status: 401,
        message: "You are not authorized to archive this post",
        errorCode: ERROR.POST_ARCHIVE_UNAUTHORIZED,
      });
    }

    post.isArchived = !post.isArchived;
    await post.save();

    return sendResponse({
      res,
      status: 200,
      message: post.isArchived
        ? "Post archived successfully"
        : "Post unarchived successfully",
      data: post,
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

const handleDeletePost = async (userId, postId, res) => {
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
    const user = await User.findById(userId);

    const post = await Post.findById(postId);

    if (!post) {
      return sendResponse({
        res,
        status: 404,
        message: "Post not found",
        errorCode: ERROR.POST_NOT_FOUND,
      });
    }

    if (post.createdBy != userId || user.isAdmin == false) {
      return sendResponse({
        res,
        status: 401,
        message: "You are not authorized to delete this post",
        errorCode: ERROR.POST_DELETE_UNAUTHORIZED,
      });
    }

    post.isDeleted = true;
    await post.save();

    return sendResponse({
      res,
      status: 200,
      message: "Post deleted successfully",
      data: post,
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

const handleUpdatePost = async (userId, postId, updatedData, res) => {
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

    const post = await Post.findById(postId).where("isDeleted").equals(false);

    if (!post) {
      return sendResponse({
        res,
        status: 404,
        message: "Post not found",
        errorCode: ERROR.POST_NOT_FOUND,
      });
    }

    if (post.createdBy != userId) {
      return sendResponse({
        res,
        status: 401,
        message: "You are not authorized to update this post",
        errorCode: ERROR.POST_UPDATE_UNAUTHORIZED,
      });
    }

    Object.keys(updatedData).forEach((update) => {
      post[update] = updatedData[update];
    });

    await post.save();

    return sendResponse({
      res,
      status: 200,
      message: "Post updated successfully",
      data: post,
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

const handleUpdateComment = async (userId, commentId, updatedData, res) => {
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

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return sendResponse({
        res,
        status: 404,
        message: "Comment not found",
        errorCode: ERROR.COMMENT_NOT_FOUND,
      });
    }

    if (comment.createdBy != userId) {
      return sendResponse({
        res,
        status: 401,
        message: "You are not authorized to update this comment",
        errorCode: ERROR.COMMENT_UPDATE_UNAUTHORIZED,
      });
    }

    Object.keys(updatedData).forEach((update) => {
      comment[update] = updatedData[update];
    });

    await comment.save();

    return sendResponse({
      res,
      status: 200,
      message: "Comment updated successfully",
      data: comment,
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

const handleUpdateReply = async (
  userId,
  commentId,
  replyId,
  updatedData,
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

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return sendResponse({
        res,
        status: 404,
        message: "Comment not found",
        errorCode: ERROR.COMMENT_NOT_FOUND,
      });
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return sendResponse({
        res,
        status: 404,
        message: "Reply not found",
        errorCode: ERROR.REPLY_NOT_FOUND,
      });
    }

    if (reply.createdBy != userId) {
      return sendResponse({
        res,
        status: 401,
        message: "You are not authorized to update this reply",
        errorCode: ERROR.REPLY_UPDATE_UNAUTHORIZED,
      });
    }

    Object.keys(updatedData).forEach((update) => {
      reply[update] = updatedData[update];
    });

    await comment.save();

    return sendResponse({
      res,
      status: 200,
      message: "Reply updated successfully",
      data: reply,
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

const handleGetUserListPosts = async (userId, cursor, limit, res) => {
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

    const query = { createdBy: userId, isDeleted: false, isArchived: false };

    if (cursor) {
      query["_id"] = { $lt: cursor };
    }
    const posts = await Post.find(query)
      .populate({
        path: "createdBy",
        select: "username avatar",
      })
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const processedPosts = posts.map((post) => ({
      ...post,
      likes: post.likes.length,
      shares: post.shares.length,
      comments: post.comments.length,
    }));

    const nextCursor =
      posts.length == limit ? posts[posts.length - 1]._id : null;

    return sendResponse({
      res,
      status: 200,
      data: {
        posts: processedPosts,
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

const handleGetUserListArchivedPosts = async (userId, cursor, limit, res) => {
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

    const query = { createdBy: userId, isDeleted: false, isArchived: true };

    if (cursor) {
      query["_id"] = { $lt: cursor };
    }

    const posts = await Post.find(query)
      .populate({ path: "createdBy", select: "username avatar" })
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const processedPosts = posts.map((post) => ({
      ...post,
      likes: post.likes.length,
      shares: post.shares.length,
      comments: post.comments.length,
    }));

    const nextCursor =
      posts.length == limit ? posts[posts.length - 1]._id : null;

    return sendResponse({
      res,
      status: 200,
      data: {
        posts: processedPosts,
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

export {
  handleCreatePost,
  handleCommentPost,
  handleInteractPost,
  handleReplyComment,
  handleArchivePost,
  handleDeletePost,
  handleUpdatePost,
  handleUpdateComment,
  handleUpdateReply,
  handleGetUserListPosts,
  handleGetUserListArchivedPosts,
};
