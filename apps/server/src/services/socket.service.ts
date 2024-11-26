import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { RoomManager } from './room.service';

/**
 * WebSocket服务类
 * 负责处理实时通信和WebRTC信令的交换
 * 
 * @class SocketService
 */
export class SocketService {
  /** Socket.IO服务器实例,用于管理WebSocket连接 */
  private io: Server;
  /** 房间管理器实例,用于管理房间和参与者状态 */
  private roomManager: RoomManager;

  /**
   * 创建Socket服务实例
   * 
   * @param {HttpServer} httpServer - HTTP服务器实例,用于Socket.IO服务器的初始化
   */
  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });
    this.roomManager = new RoomManager();
  }

  /**
   * 初始化Socket服务
   * 设置WebSocket事件监听器,处理客户端连接和信令交换
   */
  initialize() {
    this.io.on('connection', (socket) => {
      console.log('客户端连接:', socket.id);

      /**
       * 处理用户加入房间的请求
       * 将用户加入指定房间并同步房间状态
       * 
       * @param {string} roomId - 目标房间ID
       * @emits user-joined - 通知房间其他用户有新成员加入
       * @emits room-info - 向新用户发送房间当前状态
       * @emits error - 当加入房间失败时发送错误信息
       */
      socket.on('join-room', (roomId: string) => {
        console.log(`用户 ${socket.id} 尝试加入房间 ${roomId}`);
        
        try {
          // 将用户加入Socket.IO房间
          socket.join(roomId);
          // 在房间管理器中记录用户
          this.roomManager.addParticipant(roomId, socket.id);
          
          // 通知房间其他用户有新用户加入
          socket.to(roomId).emit('user-joined', socket.id);
          
          // 向新用户发送房间当前信息
          const participants = this.roomManager.getRoomParticipants(roomId);
          socket.emit('room-info', {
            roomId,
            participants: participants.filter(id => id !== socket.id)
          });

          console.log(`用户 ${socket.id} 成功加入房间 ${roomId}`);
        } catch (error) {
          console.error('加入房间失败:', error);
          socket.emit('error', { message: '加入房间失败' });
        }
      });

      /**
       * 处理WebRTC Offer信令的转发
       * 将offer信令从发送方转发给接收方
       * 
       * @param {Object} params - 信令参数
       * @param {string} params.to - 接收方的Socket ID
       * @param {RTCSessionDescriptionInit} params.offer - WebRTC offer对象
       */
      socket.on('offer', ({ to, offer }) => {
        socket.to(to).emit('offer', {
          from: socket.id,
          offer
        });
      });

      /**
       * 处理WebRTC Answer信令的转发
       * 将answer信令从发送方转发给接收方
       * 
       * @param {Object} params - 信令参数
       * @param {string} params.to - 接收方的Socket ID
       * @param {RTCSessionDescriptionInit} params.answer - WebRTC answer对象
       */
      socket.on('answer', ({ to, answer }) => {
        socket.to(to).emit('answer', {
          from: socket.id,
          answer
        });
      });

      /**
       * 处理ICE候选信息的转发
       * 将ICE候选信息从发送方转发给接收方
       * 
       * @param {Object} params - ICE候选参数
       * @param {string} params.to - 接收方的Socket ID
       * @param {RTCIceCandidateInit} params.candidate - ICE候选对象
       */
      socket.on('ice-candidate', ({ to, candidate }) => {
        socket.to(to).emit('ice-candidate', {
          from: socket.id,
          candidate
        });
      });

      /**
       * 处理用户断开连接
       * 清理用户所在的所有房间,通知其他用户,必要时删除空房间
       * 
       * @emits user-left - 通知房间其他用户该用户已离开
       */
      socket.on('disconnect', () => {
        const rooms = this.roomManager.getRoomsForParticipant(socket.id);
        rooms.forEach(roomId => {
          // 从房间移除用户
          this.roomManager.removeParticipant(roomId, socket.id);
          // 通知房间其他用户
          socket.to(roomId).emit('user-left', socket.id);
          
          // 如果房间为空,删除房间
          if (this.roomManager.getRoomParticipants(roomId).length === 0) {
            this.roomManager.removeRoom(roomId);
          }
        });
        console.log('客户端断开连接:', socket.id);
      });
    });
  }
}
