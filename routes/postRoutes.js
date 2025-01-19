import express from "express";
import authentication from "../middleware/auth.js";
import postControllers from "../controllers/postControllers.js";
import { createPostSchema } from "../models/PostSchemas.js";
import validate from "../middleware/validate.js";
const router = express.Router();

// Create New Post
router.post(
  "/api/posts",
  authentication,
  validate(createPostSchema),
  postControllers.createPost
);

// Comment Post
router.post("/api/posts/comment", authentication, postControllers.commentPost);

// Like/Unlike Post
router.post(
  "/api/posts/interact",
  authentication,
  postControllers.interactPost
);

// Share Post
router.post("/api/posts/share", authentication, postControllers.sharePost);

// Reply comment
router.post("/api/posts/reply", authentication, postControllers.replyComment);

// Archive Post
router.post("/api/posts/archive", authentication, postControllers.archivePost);

// Delete Post
router.delete("/api/posts/:postId", authentication, postControllers.deletePost);

// Update Post
router.patch("/api/posts/:postId", authentication, postControllers.updatePost);

// Update Comment
router.patch(
  "/api/posts/comment/:commentId",
  authentication,
  postControllers.updateComment
);

// Update Reply
router.patch(
  "/api/posts/reply/:commentId/:replyId",
  authentication,
  postControllers.updateReply
);

//  User's List Posts
router.get("/api/posts/me", authentication, postControllers.getUserListPosts);

// User's List Archived Posts
router.get(
  "/api/posts/archives",
  authentication,
  postControllers.getUserListArchivedPosts
);

/**
 * @swagger
 * tags:
 *   - name: Post
 *     description: API liên quan đến bài đăng và tương tác với bài đăng
 * /api/posts:
 *   post:
 *     summary: "Tạo bài đăng mới"
 *     description: "API cho phép người dùng tạo một bài đăng mới với nội dung, phương tiện và quyền riêng tư."
 *     tags:
 *      - Post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: "Nội dung của bài đăng"
 *               media:
 *                 type: array
 *                 items:
 *                  type: string
 *                 description: "Danh sách các liên kết media của bài đăng"
 *               privacy:
 *                 type: string
 *                 description: "Chế độ quyền riêng tư của bài đăng"
 *     responses:
 *       200:
 *         description: "Bài đăng đã được tạo thành công"
 *       400:
 *         description: "Thông tin bài đăng không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/posts/comment:
 *   post:
 *     summary: "Bình luận vào bài đăng"
 *     description: "API cho phép người dùng bình luận vào một bài đăng."
 *     tags:
 *      - Post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: "ID của bài đăng"
 *               content:
 *                 type: string
 *                 description: "Nội dung bình luận"
 *     responses:
 *       200:
 *         description: "Bình luận đã được tạo thành công"
 *       400:
 *         description: "Thông tin bình luận không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/posts/interact:
 *   post:
 *     summary: "Thích/Không thích bài đăng"
 *     description: "API cho phép người dùng tương tác với bài đăng (thích hoặc không thích)."
 *     tags:
 *      - Post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: "ID của bài đăng"
 *               isLike:
 *                 type: boolean
 *                 description: "Trạng thái thích (true) hoặc không thích (false)"
 *     responses:
 *       200:
 *         description: "Tương tác thành công"
 *       400:
 *         description: "Thông tin không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/posts/reply:
 *   post:
 *     summary: "Trả lời bình luận"
 *     description: "API cho phép người dùng trả lời một bình luận của bài đăng."
 *     tags:
 *      - Post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentId:
 *                 type: string
 *                 description: "ID của bình luận"
 *               content:
 *                 type: string
 *                 description: "Nội dung trả lời"
 *     responses:
 *       200:
 *         description: "Trả lời bình luận thành công"
 *       400:
 *         description: "Thông tin trả lời không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/posts/archives:
 *   post:
 *     summary: "Lưu trữ bài đăng"
 *     description: "API cho phép người dùng lưu trữ một bài đăng."
 *     tags:
 *      - Post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: "ID của bài đăng"
 *     responses:
 *       200:
 *         description: "Bài đăng đã được lưu trữ"
 *       400:
 *         description: "Thông tin bài đăng không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/posts/{postId}:
 *   delete:
 *     summary: "Xóa bài đăng"
 *     description: "API cho phép người dùng xóa một bài đăng."
 *     tags:
 *      - Post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: "ID của bài đăng cần xóa"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Bài đăng đã được xóa"
 *       400:
 *         description: "Thông tin bài đăng không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 *   patch:
 *     summary: "Cập nhật bài đăng"
 *     description: "API cho phép người dùng cập nhật một bài đăng cụ thể."
 *     tags:
 *      - Post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: "ID của bài đăng cần cập nhật"
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: "Nội dung của bài đăng"
 *               media:
 *                 type: string
 *                 description: "Liên kết media của bài đăng"
 *               privacy:
 *                 type: string
 *                 description: "Chế độ quyền riêng tư của bài đăng"
 *     responses:
 *       200:
 *         description: "Bài đăng đã được cập nhật"
 *       400:
 *         description: "Thông tin cập nhật không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/posts/comment/{commentId}:
 *   patch:
 *     summary: "Cập nhật bình luận"
 *     description: "API cho phép người dùng cập nhật một bình luận cụ thể."
 *     tags:
 *      - Post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: "ID của bình luận cần cập nhật"
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: "Nội dung của bình luận"
 *     responses:
 *       200:
 *         description: "Bình luận đã được cập nhật"
 *       400:
 *         description: "Thông tin cập nhật không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/posts/reply/{commentId}/{replyId}:
 *   patch:
 *     summary: "Cập nhật trả lời bình luận"
 *     description: "API cho phép người dùng cập nhật một trả lời bình luận cụ thể."
 *     tags:
 *      - Post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: "ID của bình luận mà trả lời thuộc về"
 *         schema:
 *           type: string
 *       - in: path
 *         name: replyId
 *         required: true
 *         description: "ID của trả lời cần cập nhật"
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: "Nội dung của trả lời"
 *     responses:
 *       200:
 *         description: "Trả lời đã được cập nhật"
 *       400:
 *         description: "Thông tin cập nhật không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/posts/me:
 *   get:
 *     summary: "Lấy danh sách bài đăng của người dùng"
 *     description: "API cho phép người dùng lấy danh sách các bài đăng của mình."
 *     tags:
 *      - Post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         required: false
 *         description: "Con trỏ cho phân trang"
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         required: false
 *         description: "Số lượng bài đăng tối đa"
 *         schema:
 *           type: integer
 *           format: int32
 *     responses:
 *       200:
 *         description: "Danh sách bài đăng của người dùng"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/posts/archive:
 *   get:
 *     summary: "Lấy danh sách bài đăng đã lưu trữ của người dùng"
 *     description: "API cho phép người dùng lấy danh sách bài đăng đã lưu trữ của mình."
 *     tags:
 *      - Post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         required: false
 *         description: "Con trỏ cho phân trang"
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         required: false
 *         description: "Số lượng bài đăng tối đa"
 *         schema:
 *           type: integer
 *           format: int32
 *     responses:
 *       200:
 *         description: "Danh sách bài đăng đã lưu trữ của người dùng"
 *       500:
 *         description: "Lỗi máy chủ"
 */

export default router;
