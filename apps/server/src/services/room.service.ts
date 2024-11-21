/**
 * 房间管理器类
 * 负责管理WebRTC房间和参与者
 */
export class RoomManager {
  /** 存储房间及其参与者的映射 */
  private rooms: Map<string, Set<string>>;
  /** 存储参与者及其所在房间的映射 */
  private participantRooms: Map<string, Set<string>>;

  /**
   * 构造函数
   * 初始化房间和参与者映射
   */
  constructor() {
    this.rooms = new Map();
    this.participantRooms = new Map();
  }

  /**
   * 创建新房间
   * @param roomId 房间ID
   * @returns 房间ID
   */
  createRoom(roomId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    return roomId;
  }

  /**
   * 将参与者添加到房间
   * @param roomId 房间ID
   * @param participantId 参与者ID
   */
  addParticipant(roomId: string, participantId: string) {
    // 创建房间（如果不存在）
    if (!this.rooms.has(roomId)) {
      this.createRoom(roomId);
    }

    // 添加参与者到房间
    this.rooms.get(roomId)?.add(participantId);

    // 记录参与者所在的房间
    if (!this.participantRooms.has(participantId)) {
      this.participantRooms.set(participantId, new Set());
    }
    this.participantRooms.get(participantId)?.add(roomId);
  }

  /**
   * 从房间移除参与者
   * @param roomId 房间ID
   * @param participantId 参与者ID
   */
  removeParticipant(roomId: string, participantId: string) {
    // 从房间移除参与者
    this.rooms.get(roomId)?.delete(participantId);
    
    // 从参与者记录中移除房间
    this.participantRooms.get(participantId)?.delete(roomId);
    
    // 如果参与者没有在任何房间中，删除记录
    if (this.participantRooms.get(participantId)?.size === 0) {
      this.participantRooms.delete(participantId);
    }
  }

  /**
   * 删除房间及其所有参与者记录
   * @param roomId 房间ID
   */
  removeRoom(roomId: string) {
    // 获取房间所有参与者
    const participants = this.rooms.get(roomId);
    if (participants) {
      // 从所有参与者记录中移除该房间
      participants.forEach(participantId => {
        this.participantRooms.get(participantId)?.delete(roomId);
      });
    }
    // 删除房间
    this.rooms.delete(roomId);
  }

  /**
   * 获取房间内所有参与者
   * @param roomId 房间ID
   * @returns 参与者ID数组
   */
  getRoomParticipants(roomId: string): string[] {
    return Array.from(this.rooms.get(roomId) || []);
  }

  /**
   * 获取参与者所在的所有房间
   * @param participantId 参与者ID
   * @returns 房间ID数组
   */
  getRoomsForParticipant(participantId: string): string[] {
    return Array.from(this.participantRooms.get(participantId) || []);
  }
} 