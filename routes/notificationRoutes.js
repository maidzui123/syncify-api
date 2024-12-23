import express, { response } from "express";
import authentication from "../middleware/auth.js";
import notificationControllers from "../controllers/notificationControllers.js";
const router = express.Router();

// Get all user's notifications
router.get("/api/notifications", authentication, notificationControllers.getUserListNotifications);

export default router;