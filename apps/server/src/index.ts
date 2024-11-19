import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { SocketService } from './services/socket.service';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // 前端开发服务器地址
    methods: ["GET", "POST"]
  }
});

const socketService = new SocketService(io);
socketService.initialize();

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
