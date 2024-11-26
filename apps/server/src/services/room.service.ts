/**
 * 房间管理器类
 * 负责管理在线会议房间和参与者的创建、加入、退出等操作
 */
export class RoomManager {
  /** 存储房间ID到参与者ID集合的映射关系 */
  private rooms: Map<string, Set<string>>;
  /** 存储参与者ID到房间ID集合的映射关系 */
  private participantRooms: Map<string, Set<string>>;

  /**
   * 初始化房间管理器
   * 创建用于存储房间和参与者关系的Map对象
   */
  constructor() {
    this.rooms = new Map();
    this.participantRooms = new Map();
  }

  /**
   * 创建新的会议房间
   * @param roomId - 房间唯一标识符
   * @returns 创建的房间ID
   */
  createRoom(roomId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    return roomId;
  }

  /**
   * 将参与者加入指定房间
   * 如果房间不存在则自动创建
   * @param roomId - 目标房间ID
   * @param participantId - 待加入的参与者ID
   */
  addParticipant(roomId: string, participantId: string) {
    // 确保房间存在
    if (!this.rooms.has(roomId)) {
      this.createRoom(roomId);
    }

    // 将参与者加入房间
    this.rooms.get(roomId)?.add(participantId);

    // 更新参与者的房间记录
    if (!this.participantRooms.has(participantId)) {
      this.participantRooms.set(participantId, new Set());
    }
    this.participantRooms.get(participantId)?.add(roomId);
  }

  /**
   * 将参与者从指定房间移除
   * @param roomId - 目标房间ID
   * @param participantId - 待移除的参与者ID
   */
  removeParticipant(roomId: string, participantId: string) {
    // 从房间中移除参与者
    this.rooms.get(roomId)?.delete(participantId);
    
    // 更新参与者的房间记录
    this.participantRooms.get(participantId)?.delete(roomId);
    
    // 清理无房间的参与者记录
    if (this.participantRooms.get(participantId)?.size === 0) {
      this.participantRooms.delete(participantId);
    }
  }

  /**
   * 删除指定房间及其所有参与者关系
   * @param roomId - 待删除的房间ID
   */
  removeRoom(roomId: string) {
    // 获取房间内所有参与者
    const participants = this.rooms.get(roomId);
    if (participants) {
      // 清理所有参与者的房间记录
      participants.forEach(participantId => {
        this.participantRooms.get(participantId)?.delete(roomId);
      });
    }
    // 删除房间记录
    this.rooms.delete(roomId);
  }

  /**
   * 获取指定房间的所有参与者列表
   * @param roomId - 目标房间ID
   * @returns 参与者ID数组
   */
  getRoomParticipants(roomId: string): string[] {
    return Array.from(this.rooms.get(roomId) || []);
  }

  /**
   * 获取指定参与者所在的所有房间列表
   * @param participantId - 目标参与者ID
   * @returns 房间ID数组
   */
  getRoomsForParticipant(participantId: string): string[] {
    return Array.from(this.participantRooms.get(participantId) || []);
  }
}