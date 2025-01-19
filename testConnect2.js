import { io } from "socket.io-client";

const socket = io("ws://localhost:3001", {
  extraHeaders: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzRhYjE5NDUxYzNiY2Y3YWEyM2NlOWIiLCJlbWFpbCI6Im1haWR1eTE5MDgwMkBnbWFpbC5jb20iLCJpYXQiOjE3MzcyNzcwNjcsImV4cCI6MTc2ODgzNDY2N30.I2ai5q9LFgvB-V_73HHdvDeWouTDVEtl1XuiLPMQP7I`,
  },
});

console.log("🥀 ~ socket:", socket);

// Xử lý kết nối socket
socket.on("connect", () => {
  console.log("Connected to socket server with ID:", socket.id);

  // Gửi sự kiện joinRoom với chatId
  const chatId = "678cbed7cb5d6f1a792f8d78"; // Chat ID cần tham gia
  socket.emit("joinRoom", { chatId });

  console.log(`Requested to join room with chatId: ${chatId}`);
});


socket.on("chatMessage", (msgData) => {
  console.log("Received message in room:", msgData);
});