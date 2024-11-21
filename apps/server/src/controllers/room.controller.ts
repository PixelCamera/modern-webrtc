import { Router, Request, Response } from 'express';
import { RoomManager } from '../services/room.service';

/**
 * 房间控制器类
 * 处理与房间相关的HTTP请求
 */
export class RoomController {
  public router: Router;
  private roomManager: RoomManager;

  /**
   * 构造函数
   * 初始化路由和房间管理器
   */
  constructor() {
    this.router = Router();
    this.roomManager = new RoomManager();
    this.initializeRoutes();
  }

  /**
   * 初始化路由
   * 设置所有端点的处理函数
   */
  private initializeRoutes() {
    this.router.post('/create', this.createRoom.bind(this));
    this.router.post('/join', this.joinRoom.bind(this));
    this.router.get('/:roomId/participants', this.getRoomParticipants.bind(this));
  }

  /**
   * 创建新房间
   * @param req - Express请求对象
   * @param res - Express响应对象
   */
  async createRoom(req: Request, res: Response) {
    try {
      // 生成随机房间ID
      const roomId = Math.random().toString(36).substring(7);
      this.roomManager.createRoom(roomId);
      res.json({ roomId });
    } catch (error) {
      res.status(500).json({ error: '创建房间失败' });
    }
  }

  /**
   * 加入现有房间
   * @param req - Express请求对象，包含roomId和participantId
   * @param res - Express响应对象
   */
  async joinRoom(req: Request, res: Response) {
    try {
      const { roomId, participantId } = req.body;
      
      // 验证房间ID是否存在
      if (!roomId) {
        return res.status(400).json({ error: '房间ID不能为空' });
      }

      // 将参与者添加到房间并获取房间内所有参与者
      this.roomManager.addParticipant(roomId, participantId);
      const participants = this.roomManager.getRoomParticipants(roomId);
      
      res.json({ roomId, participants });
    } catch (error) {
      res.status(500).json({ error: '加入房间失败' });
    }
  }

  /**
   * 获取房间内的所有参与者
   * @param req - Express请求对象，包含roomId参数
   * @param res - Express响应对象
   */
  async getRoomParticipants(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const participants = this.roomManager.getRoomParticipants(roomId);
      res.json({ participants });
    } catch (error) {
      res.status(500).json({ error: '获取参与者列表失败' });
    }
  }
}
