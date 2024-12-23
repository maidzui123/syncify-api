import express from "express";
import authentication from "../middleware/auth.js";
import userControllers from "../controllers/userControllers.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// My Profile
router.get("/api/me", authentication, userControllers.getMyProfile);

// My Profile
router.get("/api/user-profile/:userId", authentication, userControllers.getUserProfile);

// Get List Friends
router.get("/api/list-friends", authentication, userControllers.getListFriends);

// Get List Friends Request
router.get(
  "/api/list-fr-request",
  authentication,
  userControllers.getListFriendsRequest
);

// Send friend request
router.post(
  "/api/fr-request",
  authentication,
  userControllers.sendFriendRequest
);

// Accept friend request
router.post(
  "/api/accept-fr-request",
  authentication,
  userControllers.acceptFriendRequest
);

// Reject friend request
router.post(
  "/api/reject-fr-request",
  authentication,
  userControllers.rejectFriendRequest
);

// Unfriend
router.post("/api/unfriend", authentication, userControllers.unfriend);

// Search User
router.post("/api/search-user", authentication, userControllers.searchUser);

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: API liên quan đến người dùng
 *
 * /api/me:
 *   get:
 *     summary: Lấy thông tin bản thân
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của bản thân
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 * /api/user-profile/{userId}:
 *   get:
 *     summary: "Lấy thông tin user khác"
 *     tags:
 *       - User
 *     description: "Lấy thông tin user khác bằng userId."
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: "Id của user cần lấy thông tin."
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200:
 *         description: "Thành công."
 * /api/list-friends:
 *   get:
 *     summary: Lấy danh sách bạn bè
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cursor
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Con trỏ để phân trang
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Số lượng bản ghi trả về
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *
 * /api/list-fr-request:
 *   get:
 *     summary: Lấy danh sách yêu cầu kết bạn
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: type
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           example: "pending"
 *         description: Loại yêu cầu ("pending", "accepted", "rejected")
 *       - name: scope
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           example: "me"
 *         description: Phạm vi lọc yêu cầu ("me" hoặc "other")
 *       - name: cursor
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Con trỏ để phân trang
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Số lượng bản ghi trả về
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   type:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *
 * /api/fr-request:
 *   post:
 *     summary: Gửi yêu cầu kết bạn
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friendId:
 *                 type: string
 *                 description: ID của bạn muốn gửi yêu cầu
 *             required:
 *               - friendId
 *     responses:
 *       200:
 *         description: Thành công
 *
 * /api/accept-fr-request:
 *   post:
 *     summary: Chấp nhận yêu cầu kết bạn
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               frRequestId:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: Thành công
 *
 * /api/reject-fr-request:
 *   post:
 *     summary: Từ chối yêu cầu kết bạn
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               frRequestId:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: Thành công
 *
 * /api/unfriend:
 *   post:
 *     summary: Hủy kết bạn
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friendId:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: Thành công
 *
 * /api/search-user:
 *   post:
 *     summary: Tìm kiếm người dùng
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "John"
 *               tag:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   tag:
 *                     type: string
 */

export default router;
