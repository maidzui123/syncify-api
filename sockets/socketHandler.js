import jwt from "jsonwebtoken";
import * as userServices from "../services/userServices.js";
import { handleSendNotification } from "../services/notificationServices.js";
import { pubClient, subClient } from "./redisClient.js";
const socketHandler = (io) => {
  io.use((socket, next) => {
    const headers = socket.handshake.headers;
    const token = headers["authorization"].split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error: Invalid token"));
      }

      socket.userId = decoded._id;
      socket.join(socket.userId.toString());

      return next();
    });
  });

  io.on("connection", (socket) => {
    // User Online
    socket.on("userConnect", async () => {
      await userServices.handleUpdateStatus(socket.userId, true);

      const listFriends = await userServices.getListFriendsAll(socket.userId);

      listFriends.forEach((friend) => {
        pubClient.publish(
          "userOnline",
          JSON.stringify({
            friendId: friend._id.toString(),
            userId: socket.userId,
            connectedAt: new Date(),
          })
        );
      });
    });

    // User Offline
    socket.on("disconnect", async () => {
      await userServices.handleUpdateStatus(socket.userId, false);
      const listFriends = await userServices.getListFriendsAll(socket.userId);

      listFriends.forEach((friend) => {
        pubClient.publish(
          "userOffline",
          JSON.stringify({
            friendId: friend._id.toString(),
            userId: socket.userId,
            disconnectedAt: new Date(),
          })
        );
      });
    });
  });

  // Redis Subscriber for Pub/Sub
  subClient.subscribe(
    "userOnline",
    "userOffline",
    "friendRequest",
    "acceptFriendRequest",
    "like",
    "comment",
    "replyComment"
  );

  subClient.on("message", (channel, message) => {
    const eventData = JSON.parse(message);

    if (channel === "userOnline") {
      io.to(eventData.friendId).emit("userOnline", {
        userId: eventData.userId,
        connectedAt: eventData.connectedAt,
      });
    } else if (channel === "userOffline") {
      io.to(eventData.friendId).emit("userOffline", {
        userId: eventData.userId,
        disconnectedAt: eventData.disconnectedAt,
      });
    } else {
      io.to(eventData.userId).emit(channel, eventData);
    }
  });
};

const sendNotification = async (userId, otherUserId, type) => {
  const payload = await handleSendNotification(userId, otherUserId, type);

  if (!payload) {
    return;
  }

  pubClient.publish(type, JSON.stringify(payload));
};
export { socketHandler, sendNotification };
