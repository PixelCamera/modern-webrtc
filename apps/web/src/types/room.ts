/**
 * 房间状态接口
 * 管理视频会议房间的核心状态数据,包括连接状态、媒体流和错误信息等
 * @interface RoomState
 */
export interface RoomState {
  /** 房间的唯一标识符 */
  roomId: string | null;
  /** 本地用户的音视频媒体流 */
  localStream: MediaStream | null;
  /** 远程用户的音视频媒体流 */
  remoteStream: MediaStream | null;
  /** 当前房间的错误信息 */
  error: string | null;
  /** 是否正在建立WebRTC连接 */
  isConnecting: boolean;
}

/**
 * 房间状态更新动作类型
 * 定义了所有可能的状态更新操作,用于Redux reducer处理状态变更
 * @type RoomAction
 */
export type RoomAction =
  /** 设置或更新房间ID */
  | { type: 'SET_ROOM_ID'; payload: string }
  /** 设置本地音视频流 */
  | { type: 'SET_LOCAL_STREAM'; payload: MediaStream }
  /** 设置远程音视频流 */
  | { type: 'SET_REMOTE_STREAM'; payload: MediaStream }
  /** 设置错误状态 */
  | { type: 'SET_ERROR'; payload: string }
  /** 更新连接状态 */
  | { type: 'SET_CONNECTING'; payload: boolean }
  /** 重置所有状态到初始值 */
  | { type: 'RESET' };

/**
 * WebRTC信令数据接口
 * 用于在对等端之间交换建立连接所需的各类信息
 * @interface SignalingData
 */
export interface SignalingData {
  /** 信令发送方的用户ID */
  from: string;
  /** 信令接收方的用户ID */
  to: string;
  /** WebRTC连接发起方的会话描述信息 */
  offer?: RTCSessionDescriptionInit;
  /** WebRTC连接接收方的会话描述信息 */
  answer?: RTCSessionDescriptionInit;
  /** ICE协议的网络连接候选信息 */
  candidate?: RTCIceCandidateInit;
}

/**
 * 房间基本信息接口
 * 包含房间的基础元数据
 * @interface RoomInfo
 */
export interface RoomInfo {
  /** 当前房间中的所有参与者ID列表 */
  participants: string[];
}

/**
 * Socket连接错误接口
 * 定义WebSocket连接过程中的错误信息结构
 * @interface SocketError
 */
export interface SocketError {
  /** 错误的详细描述信息 */
  message: string;
  /** 错误的分类代码,用于错误处理 */
  code?: string;
}