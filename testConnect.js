import { io } from "socket.io-client";

const socket = io("ws://localhost:5001", {
  extraHeaders: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzRhYmVjZjFjYTJmMGZkNjg2ZGU5OTgiLCJlbWFpbCI6InluMDMwOUBnbWFpbC5jb20iLCJpYXQiOjE3MzM3NDg0MzEsImV4cCI6MTc2NTMwNjAzMX0.dsYGkmQVRs40EvuHZQJ3Q-OtuvQrCEvmTDRGKlEwpOY`,
  },
});

console.log("🥀 ~ socket:", socket);

// Emit sự kiện `userConnect`
socket.emit("userConnect");