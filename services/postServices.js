import { User } from "../models/UserSchemas.js";
import { Post } from "../models/PostSchemas.js";
import { Comment } from "../models/CommentSchemas.js";
import sendResponse from "../helper/sendResponse.helper.js";
const handleCreatePost = async (userId, content, media, privacy, res) => {
  try {
    const user = User.findById(userId);

    if (!user) {
      return sendResponse({ res, status: 401, message: "Access Denied" });
    }

    if (media.length > 5) {
      return sendResponse({
        res,
        status: 400,
        message: "Media maximum limit is 5",
      });
    }

    if (content === "") {
      return sendResponse({
        res,
        status: 400,
        message: "Content is required",
      });
    }
    const videoCount = media.filter((item) => item.type === "video").length;

    if (videoCount > 2) {
      return sendResponse({
        res,
        status: 400,
        message: "Video maximum limit is 2",
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
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleCommentPost = async (userId, postId, content, res) => {
  try {
    if (!userId) {
      return sendResponse({ res, status: 401, message: "Access Denied" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return sendResponse({ res, status: 404, message: "Post not found" });
    }

    const comment = await Comment.create({
      createdBy: userId,
      content,
    });

    post.comments.push(comment);
    await post.save();

    return sendResponse({
      res,
      status: 200,
      message: "Comment created successfully",
      data: comment,
    });
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleInteractPost = async (userId, postId, isLike, res) => {
  try {
    if (!userId) {
      return sendResponse({ res, status: 401, message: "Access Denied" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return sendResponse({ res, status: 404, message: "Post not found" });
    }

    if (isLike) {
      if (post.likes.includes(userId)) {
        return sendResponse({
          res,
          status: 400,
          message: "You have already liked this post",
        });
      }
      post.likes.push(userId);
    } else {
      if (!post.likes.includes(userId)) {
        return sendResponse({
          res,
          status: 400,
          message: "You have not liked this post",
        });
      }
      post.likes.pop(userId);
      console.log("🥀 ~ handleInteractPost ~ post.likes:", post.likes);
    }

    await post.save();

    return sendResponse({
      res,
      status: 200,
      message: isLike ? "Post liked successfully" : "Post unliked successfully",
      data: post,
    });
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleReplyComment = async (userId, commentId, content, res) => {
  try {
    if (!userId) {
      return sendResponse({ res, status: 401, message: "Access Denied" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return sendResponse({ res, status: 404, message: "Comment not found" });
    }

    comment.replies.push({ user: userId, content });

    comment.save();

    return sendResponse({
      res,
      status: 200,
      message: "Reply comment successfully",
      data: comment,
    });
  } catch (error) {
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleArchivePost = async (userId, postId, res) => {
  try {
    if (!userId) {
      return sendResponse({ res, status: 401, message: "Access Denied" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return sendResponse({ res, status: 404, message: "Post not found" });
    }

    if (post.createdBy != userId) {
      return sendResponse({
        res,
        status: 401,
        message: "You are not authorized to archive this post",
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
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleDeletePost = async (userId, postId, res) => {
  try {
    if (!userId) {
      return sendResponse({ res, status: 401, message: "Access Denied" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return sendResponse({ res, status: 404, message: "Post not found" });
    }

    if (post.createdBy != userId) {
      return sendResponse({
        res,
        status: 401,
        message: "You are not authorized to delete this post",
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
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleUpdatePost = async (userId, postId, updatedData, res) => {
  try {
    if (!userId) {
      return sendResponse({ res, status: 401, message: "Access Denied" });
    }

    const post = await Post.findById(postId).where("isDeleted").equals(false);

    if (!post) {
      return sendResponse({ res, status: 404, message: "Post not found" });
    }

    if (post.createdBy != userId) {
      return sendResponse({
        res,
        status: 401,
        message: "You are not authorized to update this post",
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
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleUpdateComment = async (userId, commentId, updatedData, res) => {
  try {
    if (!userId) {
      return sendResponse({ res, status: 401, message: "Access Denied" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return sendResponse({ res, status: 404, message: "Comment not found" });
    }

    if (comment.createdBy != userId) {
      return sendResponse({
        res,
        status: 401,
        message: "You are not authorized to update this comment",
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
    return sendResponse({ res, status: 500, message: error.message });
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
    if (!userId) {
      return sendResponse({ res, status: 401, message: "Access Denied" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return sendResponse({ res, status: 404, message: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return sendResponse({ res, status: 404, message: "Reply not found" });
    }

    if (reply.createdBy != userId) {
      return sendResponse({
        res,
        status: 401,
        message: "You are not authorized to update this reply",
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
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleGetUserListPosts = async (userId, cursor, limit, res) => {
  try {
    const checkUser = await User.findById(userId);

    if (!checkUser) {
      return sendResponse({ res, status: 401, message: "Access Denied" });
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
    return sendResponse({ res, status: 500, message: error.message });
  }
};

const handleGetUserListArchivedPosts = async (userId, cursor, limit, res) => {
  try {
    const checkUser = await User.findById(userId);

    if (!checkUser) {
      return sendResponse({ res, status: 401, message: "Access Denied" });
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
    return sendResponse({ res, status: 500, message: error.message });
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
  handleGetUserListArchivedPosts
};
