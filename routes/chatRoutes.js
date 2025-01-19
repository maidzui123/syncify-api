import express from "express";
import authentication from "../middleware/auth.js";
import chatControllers from "../controllers/chatControllers.js";

const router = express.Router();

// Join a new chat
router.post("/api/chats", authentication, chatControllers.createChat);

// Send a message
router.post("/api/messages", authentication, chatControllers.sendMessage);

// Get chats list
router.get("/api/chats", authentication, chatControllers.getAllChats);

// Get all messages in a chat
router.get(
  "/api/messages/:chatId",
  authentication,
  chatControllers.getAllMessages
);

// Delete a chat
// router.delete("/api/chats/:chatId", authentication, chatControllers.deleteChat);

/**
 * @swagger
 * tags:
 *   - name: Chat
 *     description: API liên quan đến nhắn tin giữa các user
 * 
 * /api/chats:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Tạo một cuộc trò chuyện mới
 *     description: Tạo một cuộc trò chuyện giữa các user nếu chưa tồn tại.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array chứa ID của các user tham gia cuộc trò chuyện.
 *             required:
 *               - participants
 *     responses:
 *       200:
 *         description: Tạo cuộc trò chuyện thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chat:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     participants:
 *                       type: array
 *                       items:
 *                         type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 * 
 *   get:
 *     tags:
 *       - Chat
 *     summary: Lấy danh sách các cuộc trò chuyện
 *     description: Trả về danh sách các cuộc trò chuyện của người dùng với tin nhắn cuối cùng.
 *     parameters:
 *       - name: cursor
 *         in: query
 *         schema:
 *           type: string
 *         required: false
 *         description: Cursor để phân trang (nếu không có, lấy từ đầu danh sách).
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *         required: false
 *         description: Số lượng cuộc trò chuyện trả về (mặc định 10).
 *     responses:
 *       200:
 *         description: Trả về danh sách các cuộc trò chuyện.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       chatId:
 *                         type: string
 *                       participants:
 *                         type: array
 *                         items:
 *                           type: string
 *                       lastMessage:
 *                         type: object
 *                         properties:
 *                           content:
 *                             type: string
 *                           senderId:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                 nextCursor:
 *                   type: string
 *                   nullable: true
 *                   description: Cursor cho trang tiếp theo (null nếu không còn dữ liệu).
 * 
 * /api/messages/{chatId}:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Lấy danh sách tin nhắn trong một cuộc trò chuyện
 *     description: Trả về danh sách tin nhắn với phân trang bằng cursor.
 *     parameters:
 *       - name: chatId
 *         in: path
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của cuộc trò chuyện.
 *       - name: cursor
 *         in: query
 *         schema:
 *           type: string
 *         required: false
 *         description: Cursor để phân trang (nếu không có, lấy từ đầu danh sách).
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *         required: false
 *         description: Số lượng tin nhắn trả về (mặc định 20).
 *     responses:
 *       200:
 *         description: Trả về danh sách tin nhắn.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       senderId:
 *                         type: string
 *                       content:
 *                         type: string
 *                       type:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 nextCursor:
 *                   type: string
 *                   nullable: true
 *                   description: Cursor cho trang tiếp theo (null nếu không còn dữ liệu).
 * 
 * /api/messages:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Gửi một tin nhắn mới
 *     description: Lưu tin nhắn vào cơ sở dữ liệu và gửi thông báo qua Socket.io.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 description: ID của cuộc trò chuyện.
 *               senderId:
 *                 type: string
 *                 description: ID của người gửi.
 *               receiverId:
 *                 type: string
 *                 description: ID của người nhận.
 *               content:
 *                 type: string
 *                 description: Nội dung tin nhắn.
 *               type:
 *                 type: string
 *                 description: Loại tin nhắn (text, image, etc.).
 *             required:
 *               - chatId
 *               - senderId
 *               - receiverId
 *               - content
 *               - type
 *     responses:
 *       200:
 *         description: Gửi tin nhắn thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     chatId:
 *                       type: string
 *                     senderId:
 *                       type: string
 *                     receiverId:
 *                       type: string
 *                     content:
 *                       type: string
 *                     type:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 */

export default router;
