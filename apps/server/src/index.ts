// 导入必要的模块
import express from 'express';
import { createServer } from 'https';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// 创建Express应用
const app = express();

// 设置根路由
app.get('/', (req, res) => {
  res.send('WebRTC 信令服务器正在运行');
});

// 配置HTTPS选项
const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '../cert/key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, '../cert/cert.pem'))
};

// 创建HTTPS服务器
const httpsServer = createServer(httpsOptions, app);

// 配置CORS中间件
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true
}));

// 创建Socket.IO服务器实例并配置CORS
const io = new Server(httpsServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 处理Socket.IO连接事件
io.on('connection', (socket) => {
  console.log('用户已连接:', socket.id);
  
  // 处理加入房间事件
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    // 获取房间中的其他用户
    const otherUsers = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
      .filter(id => id !== socket.id);
    
    // 通知房间其他用户有新用户加入
    socket.to(roomId).emit('user-joined', socket.id);
    // 向新用户发送房间信息
    socket.emit('room-info', {
      roomId,
      participants: otherUsers
    });
  });

  // 处理WebRTC offer信令
  socket.on('offer', ({ to, offer }) => {
    socket.to(to).emit('offer', {
      from: socket.id,
      offer
    });
  });

  // 处理WebRTC answer信令
  socket.on('answer', ({ to, answer }) => {
    socket.to(to).emit('answer', {
      from: socket.id,
      answer
    });
  });

  // 处理ICE候选信息
  socket.on('ice-candidate', ({ to, candidate }) => {
    socket.to(to).emit('ice-candidate', {
      from: socket.id,
      candidate
    });
  });

  // 处理断开连接事件
  socket.on('disconnect', () => {
    console.log('用户已断开连接:', socket.id);
  });
});

// 启动服务器
const PORT = 3000;
httpsServer.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 https://0.0.0.0:${PORT}`);
  console.log(`本地访问: https://localhost:${PORT}`);
  console.log(`局域网访问: https://192.168.2.36:${PORT}`);
});
