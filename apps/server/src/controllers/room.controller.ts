import { Router, Request, Response } from 'express';
import { RoomManager } from '../services/room.service';

/**
 * 房间控制器
 * 负责处理房间相关的HTTP请求,包括创建房间、加入房间和获取参与者信息
 */
export class RoomController {
  /** Express路由实例 */
  public router: Router;
  /** 房间管理器实例 */
  private roomManager: RoomManager;

  /**
   * 初始化路由和房间管理器
   */
  constructor() {
    this.router = Router();
    this.roomManager = new RoomManager();
    this.initializeRoutes();
  }

  /**
   * 配置路由映射
   * 将HTTP请求路径与对应的处理方法关联
   */
  private initializeRoutes() {
    this.router.post('/create', this.createRoom.bind(this));
    this.router.post('/join', this.joinRoom.bind(this));
    this.router.get('/:roomId/participants', this.getRoomParticipants.bind(this));
  }

  /**
   * 创建新的房间
   * 
   * @param req - Express请求对象
   * @param res - Express响应对象
   * @returns {Promise<void>} 返回包含新房间ID的JSON响应
   * @throws 创建失败时返回500错误
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
   * 将参与者加入指定房间
   * 
   * @param req - Express请求对象,包含roomId和participantId
   * @param res - Express响应对象
   * @returns {Promise<void>} 返回包含房间信息和参与者列表的JSON响应
   * @throws 参数验证失败返回400错误,加入失败返回500错误
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
   * 获取指定房间的所有参与者
   * 
   * @param req - Express请求对象,包含roomId路径参数
   * @param res - Express响应对象
   * @returns {Promise<void>} 返回包含参与者列表的JSON响应
   * @throws 获取失败时返回500错误
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
