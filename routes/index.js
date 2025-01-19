import express from "express";
import authRouters from "./authRoutes.js";
import userRouters from "./userRoutes.js";
import postRouters from "./postRoutes.js";
import notificationRouters from "./notificationRoutes.js";
import chatRoutes from "./chatRoutes.js";

const router = express.Router();

router.get("/ping", (req, res) => res.sendStatus(200));

router.use(authRouters);
router.use(userRouters);
router.use(postRouters);
router.use(notificationRouters);
router.use(chatRoutes);

export default router;
