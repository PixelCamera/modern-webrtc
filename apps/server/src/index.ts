/**
 * WebRTC 信令服务器
 * 提供基于Socket.IO的实时通信功能，支持WebRTC点对点连接的建立
 */

// 导入外部依赖
import express from 'express';
import { createServer } from 'https';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

// 初始化Express应用实例
const app = express();

// 配置根路由,用于服务器状态检查
app.get('/', (req, res) => {
  res.send('WebRTC 信令服务器正在运行');
});

// 读取SSL证书配置
const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '../cert/key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, '../cert/cert.pem'))
};

// 创建HTTPS服务器实例
const httpsServer = createServer(httpsOptions, app);

// 配置全局CORS策略
app.use(cors({
  origin: "*",          // 允许所有来源
  methods: ["GET", "POST"], // 允许的HTTP方法
  credentials: true     // 允许携带凭证
}));

// 初始化Socket.IO服务器并配置CORS
const io = new Server(httpsServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

/**
 * Socket.IO连接处理
 * 管理WebRTC信令过程，包括：
 * - 房间管理
 * - Offer/Answer交换
 * - ICE候选信息传递
 */
io.on('connection', (socket) => {
  console.log('用户已连接:', socket.id);
  
  /**
   * 处理用户加入房间
   * @param {string} roomId - 房间标识符
   */
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    // 获取当前房间其他用户列表
    const otherUsers = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
      .filter(id => id !== socket.id);
    
    // 广播新用户加入消息
    socket.to(roomId).emit('user-joined', socket.id);
    // 向新用户发送房间当前状态
    socket.emit('room-info', {
      roomId,
      participants: otherUsers
    });
  });

  /**
   * 处理WebRTC offer信令
   * 转发offer到目标用户
   */
  socket.on('offer', ({ to, offer }) => {
    socket.to(to).emit('offer', {
      from: socket.id,
      offer
    });
  });

  /**
   * 处理WebRTC answer信令
   * 转发answer到目标用户
   */
  socket.on('answer', ({ to, answer }) => {
    socket.to(to).emit('answer', {
      from: socket.id,
      answer
    });
  });

  /**
   * 处理ICE候选信息
   * 转发candidate到目标用户
   */
  socket.on('ice-candidate', ({ to, candidate }) => {
    socket.to(to).emit('ice-candidate', {
      from: socket.id,
      candidate
    });
  });

  /**
   * 处理用户断开连接
   * 清理相关资源
   */
  socket.on('disconnect', () => {
    console.log('用户已断开连接:', socket.id);
  });
});

// 启动服务器并监听指定端口
const PORT = 3000;
httpsServer.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 https://0.0.0.0:${PORT}`);
  console.log(`本地访问: https://localhost:${PORT}`);
  console.log(`局域网访问: https://192.168.2.36:${PORT}`);
});
