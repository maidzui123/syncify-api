import jwt from "jsonwebtoken";
import * as userServices from "../services/userServices.js";
const socketHandler = (io, pubClient, subClient) => {
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
        // socket.to(data._id.toString()).emit("userOnline", {
        //   userId: socket.userId,
        //   connectedAt: new Date(),
        // });
      });
    });

    // User Offline
    socket.on("disconnect", async () => {
      await userServices.handleUpdateStatus(socket.userId, false);
      const listFriends = await userServices.getListFriendsAll(socket.userId);
      console.log("🚀 ~ socket.on ~ listFriends:", listFriends);

      listFriends.forEach((friend) => {
        pubClient.publish(
          "userOffline",
          JSON.stringify({
            friendId: friend._id.toString(),
            userId: socket.userId,
            disconnectedAt: new Date(),
          })
        );
        // socket.to(data._id.toString()).emit("userOffline", {
        //   userId: socket.userId,
        //   disconnectedAt: new Date(),
        // });
      });
    });
  });

  // Redis Subscriber for Pub/Sub
  subClient.subscribe("userOnline", "userOffline");

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
    }
  });
};

export default socketHandler;