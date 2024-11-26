import { create } from 'zustand';

/**
 * 连接状态管理接口
 * @interface ConnectionState
 * @property {boolean} isConnected - 当前连接状态
 * @property {boolean} isConnecting - 连接进行中状态
 * @property {string | null} error - 连接错误信息
 * @property {function} setConnected - 更新连接状态
 * @property {function} setConnecting - 更新连接中状态
 * @property {function} setError - 更新错误信息
 */
interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * 创建连接状态管理Store
 * 使用Zustand管理连接相关的全局状态
 */
export const useConnectionStore = create<ConnectionState>((set) => ({
  // 连接状态初始值
  isConnected: false,
  isConnecting: false,
  error: null,

  // 状态更新方法
  setConnected: (connected) => set({ isConnected: connected }),
  setConnecting: (connecting) => set({ isConnecting: connecting }), 
  setError: (error) => set({ error }),
}));