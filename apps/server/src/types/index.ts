/**
 * 表示一个在线会议房间的数据结构
 * @interface Room
 * @property {string} id - 房间的唯一标识符
 * @property {string[]} participants - 房间内所有参与者的ID列表
 */
export interface Room {
  id: string;
  participants: string[];
}

/**
 * 表示一个会议参与者的数据结构
 * @interface Participant
 * @property {string} id - 参与者的唯一标识符
 * @property {string[]} rooms - 参与者当前加入的所有房间ID列表
 */
export interface Participant {
  id: string;
  rooms: string[];
}

/**
 * 加入房间请求的数据结构
 * @interface RoomJoinRequest
 * @property {string} roomId - 目标房间的唯一标识符
 * @property {string} participantId - 请求加入的参与者ID
 */
export interface RoomJoinRequest {
  roomId: string;
  participantId: string;
}

/**
 * 加入房间响应的数据结构
 * @interface RoomJoinResponse
 * @property {string} roomId - 已加入房间的唯一标识符
 * @property {string[]} participants - 房间内当前所有参与者的ID列表
 */
export interface RoomJoinResponse {
  roomId: string;
  participants: string[];
}