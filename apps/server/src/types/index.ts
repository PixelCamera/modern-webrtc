// 房间
export interface Room {
  id: string; // 房间ID
  participants: string[]; // 参与者列表
}

// 参与者
export interface Participant {
  id: string; // ID
  rooms: string[]; // 所在房间列表
}

// 加入房间请求
export interface RoomJoinRequest {
  roomId: string; // 房间ID
  participantId: string; // 参与者ID
}

// 加入房间响应
export interface RoomJoinResponse {
  roomId: string; // 房间ID
  participants: string[]; // 参与者列表
}