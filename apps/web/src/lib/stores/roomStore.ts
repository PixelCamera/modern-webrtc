import { create } from 'zustand';

/**
 * 房间状态管理接口
 * @interface RoomState
 * @property {string | null} roomId - 当前房间ID
 * @property {string[]} participants - 房间内参与者ID列表
 * @property {function} setRoomId - 更新房间ID
 * @property {function} addParticipant - 添加新的参与者
 * @property {function} removeParticipant - 移除指定参与者
 */
interface RoomState {
  roomId: string | null;
  participants: string[];
  setRoomId: (id: string | null) => void;
  addParticipant: (id: string) => void;
  removeParticipant: (id: string) => void;
}

/**
 * 创建房间状态管理Store
 * 使用Zustand管理房间相关的全局状态
 */
export const useRoomStore = create<RoomState>((set) => ({
  // 初始化状态
  roomId: null,
  participants: [],
  
  /**
   * 设置当前房间ID
   * @param {string | null} id - 新的房间ID，null表示退出房间
   */
  setRoomId: (id) => set({ roomId: id }),
  
  /**
   * 向参与者列表添加新成员
   * @param {string} id - 新参与者的ID
   */
  addParticipant: (id) =>
    set((state) => ({
      participants: [...state.participants, id],
    })),
    
  /**
   * 从参与者列表移除指定成员
   * @param {string} id - 要移除的参与者ID
   */
  removeParticipant: (id) =>
    set((state) => ({
      participants: state.participants.filter((p) => p !== id),
    })),
}));