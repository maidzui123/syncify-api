import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import Redis from "ioredis";
import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
import router from "./routes/index.js";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import socketHandler from "./sockets/socketHandler.js";
import { createAdapter } from "@socket.io/redis-adapter";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Swagger setup
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Syncify's API Documentation",
      version: "1.0.0",
      description: "API Documentation for Syncify project",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};
const specs = swaggerJsDoc(options);

// Database and Redis URL
const dbUrl = process.env.DB_URL;
const redisUrl = process.env.REDIS_URL || "";

// Redis connection
const pubClient = new Redis(redisUrl);
const subClient = pubClient.duplicate();

// Database connection
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Create HTTP server and integrate with Socket.IO + Redis
const server = http.createServer(app);
const io = new Server(server, {
  adapter: createAdapter(pubClient, subClient),
});

// Initialize socket handler
socketHandler(io, pubClient, subClient);

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./public"));
app.use(router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  swaggerDocs: {
    authAction: {
      JWT: {
        name: "Bearer token",
        schema: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
        },
        value: "Bearer <JWT>",
      },
    },
  },
}));


server.listen(port, () => {
  console.log("Redis and Socket connected");
  console.log(`Server is running on port ${port}`);
  console.log(`Server is listening at http://localhost:${port}`);
});
