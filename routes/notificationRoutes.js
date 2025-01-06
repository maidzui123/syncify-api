import express, { response } from "express";
import authentication from "../middleware/auth.js";
import notificationControllers from "../controllers/notificationControllers.js";
const router = express.Router();

// Get all user's notifications
router.get("/api/notifications", authentication, notificationControllers.getUserListNotifications);

// Mark one notification as read
router.post("/api/notifications/mark-read", authentication, notificationControllers.markNotificationAsRead);
/**
 * @swagger
 * tags:
 *   - name: Notification
 *     description: API liên quan đến thông báo
 *
 * /api/notifications:
 *   get:
 *     summary: Lấy danh sách thông báo
 *     tags:
 *       - Notification
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
 * /api/notifications/mark-read:
 *   post:
 *     summary: Đánh dấu thông báo là đã đọc
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationId:
 *                 type: integer
 *                 description: ID của thông báo cần đánh dấu là đã đọc
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       401:
 *         description: Không được phép
 */ 

export default router;