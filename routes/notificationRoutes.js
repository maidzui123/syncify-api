import express, { response } from "express";
import authentication from "../middleware/auth.js";
import notificationControllers from "../controllers/notificationControllers.js";
const router = express.Router();

// Get all user's notifications
router.get("/api/notifications/list", authentication, notificationControllers.getUserListNotifications);

/**
 * @swagger
 * tags:
 *   - name: Notification
 *     description: API liên quan đến thông báo
 *
 * /api/notifications/list:
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
 */ 

export default router;