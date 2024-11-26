/**
 * @file Room.tsx
 * @description 视频聊天房间组件，实现WebRTC点对点视频通话功能
 */

/**
 * 导入依赖
 */
import { RoomInfo, SocketError, SignalingData } from '../types/room';
import { useEffect, useCallback, useState, useRef } from 'react';
import { WebRTCConnection } from '../lib/webrtc';
import { useConnectionStore } from '../lib/stores/connectionStore';
import { useRoomStore } from '../lib/stores/roomStore';
import { socket } from '../lib/socket';
import { Button } from './ui/button';
import { MediaControls } from './MediaControls';
import { DeviceSelect } from './DeviceSelect';
import { VideoPreview } from './VideoPreview';
import { logger } from '../lib/logger';
import { formatError } from '@/lib/utils';

/** 房间ID长度常量 */
const ROOM_ID_LENGTH = 7;

/**
 * 生成随机房间ID
 * @returns {string} 7位随机字符串
 */
const generateRoomId = (): string => 
  Math.random().toString(36).substring(ROOM_ID_LENGTH);

/**
 * 房间控制组件
 * @component
 * @param {Object} props
 * @param {() => void} props.onCreateRoom - 创建房间回调
 * @param {(roomId: string) => void} props.onJoinRoom - 加入房间回调
 */
const RoomControls: React.FC<{
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}> = ({ onCreateRoom, onJoinRoom }) => {
  const [inputRoomId, setInputRoomId] = useState('');

  const handleJoinRoom = () => {
    if (inputRoomId.trim()) {
      onJoinRoom(inputRoomId);
      setInputRoomId('');
    }
  };

  return (
    <div className="flex gap-4 mb-4">
      <Button onClick={onCreateRoom}>创建房间</Button>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="输入房间ID"
          className="px-2 py-1 border rounded"
          value={inputRoomId}
          onChange={(e) => setInputRoomId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
        />
        <Button onClick={handleJoinRoom} disabled={!inputRoomId.trim()}>
          加入房间
        </Button>
      </div>
    </div>
  );
};

/**
 * 视频网格组件
 * @component
 * @param {Object} props
 * @param {MediaStream | null} props.localStream - 本地视频流
 * @param {MediaStream | null} props.remoteStream - 远程视频流
 */
const VideoGrid: React.FC<{
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}> = ({ localStream, remoteStream }) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <h3 className="mb-2">本地视频</h3>
      <div className="w-full aspect-video">
        <VideoPreview 
          stream={localStream}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
    <div>
      <h3 className="mb-2">远程视频</h3>
      <div className="w-full aspect-video">
        <VideoPreview 
          stream={remoteStream}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </div>
);

/**
 * 主房间组件
 * @component
 * @description 管理WebRTC连接、媒体流和房间状态的主组件
 */
export function Room(): JSX.Element {
  const [rtcConnection, setRtcConnection] = useState<WebRTCConnection | null>(null);
  const { setConnecting, error, setError } = useConnectionStore();
  const { roomId, setRoomId } = useRoomStore();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const mountedRef = useRef(true);

  // 用于跟踪最新状态的refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const rtcConnectionRef = useRef<WebRTCConnection | null>(null);

  /**
   * 清理资源
   * 停止所有媒体流并关闭RTC连接
   */
  const cleanup = useCallback(() => {
    if (!mountedRef.current) return;
    
    logger.info('Room', '执行清理...');
    if (localStream) {
      logger.info('Room', '清理本地流...');
      localStream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
      setLocalStream(null);
    }

    if (remoteStream) {
      logger.info('Room', '清理远程流...');
      remoteStream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
      setRemoteStream(null);
    }

    if (rtcConnection) {
      logger.info('Room', '清理RTC连接...');
      rtcConnection.cleanup();
      setRtcConnection(null);
    }
  }, [localStream, remoteStream, rtcConnection]);

  /**
   * 处理初始化错误
   * @param {unknown} err - 错误对象
   */
  const handleInitializationError = useCallback((err: unknown) => {
    logger.error('Room', '初始化失败:', formatError(err));
    if (mountedRef.current) {
      setError(err instanceof Error ? err.message : '初始化失败');
      cleanup();
    }
  }, [cleanup, setError]);

  // 更新refs以跟踪最新状态
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    rtcConnectionRef.current = rtcConnection;
  }, [rtcConnection]);

  /**
   * WebRTC初始化
   * 获取媒体设备权限并建立连接
   */
  useEffect(() => {
    let isInitializing = false;
    mountedRef.current = true;

    const initializeWebRTC = async () => {
      if (isInitializing || !mountedRef.current) {
        logger.info('Room', '跳过初始化: 正在进行中或组件未挂载');
        return;
      }
      
      try {
        isInitializing = true;
        logger.info('Room', '开始初始化 WebRTC');

        // 检查现有连接
        if (localStreamRef.current?.active && rtcConnectionRef.current) {
          logger.info('Room', '跳过初始化: 已存在活跃连接');
          return;
        }

        setConnecting(true);
        setError('');

        // 获取媒体流
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        }).catch((err: Error) => {
          throw new Error(`获取媒体设备失败: ${err.message}`);
        });

        // 检查组件是否仍然挂载
        if (!mountedRef.current) {
          logger.info('Room', '组件已卸载，清理媒体流');
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        // 创建新连接
        const connection = new WebRTCConnection((newRemoteStream) => {
          if (mountedRef.current) {
            logger.info('Room', `收到远程流: ${newRemoteStream.id}`);
            setRemoteStream(newRemoteStream);
          }
        });

        // 设置本地流
        await connection.setLocalStream(stream);
        
        if (mountedRef.current) {
          setLocalStream(stream);
          setRtcConnection(connection);
          logger.info('Room', 'WebRTC 初始化成功');
        } else {
          stream.getTracks().forEach(track => track.stop());
          connection.cleanup();
        }
      } catch (err) {
        handleInitializationError(err);
      } finally {
        if (mountedRef.current) {
          setConnecting(false);
        }
        isInitializing = false;
      }
    };

    // 使用Promise处理初始化
    const initialize = async () => {
      try {
        await initializeWebRTC();
      } catch (error) {
        logger.error('Room', '初始化过程中发生错误:', formatError(error));
      }
    };

    // 延迟初始化确保组件完全挂载
    const timeoutId = setTimeout(() => {
      void initialize();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup, handleInitializationError, setConnecting, setError]);

  /**
   * 房间管理方法
   */
  const handleCreateRoom = useCallback(() => {
    const newRoomId = generateRoomId();
    logger.info('Room', `创建新房间: ${newRoomId}`);
    setRoomId(newRoomId);
    socket.emit('join-room', newRoomId);
  }, [setRoomId]);

  const handleJoinRoom = useCallback((roomId: string) => {
    logger.info('Room', `加入房间: ${roomId}`);
    setRoomId(roomId);
    socket.emit('join-room', roomId);
  }, [setRoomId]);

  /**
   * WebRTC信令处理
   * 处理用户加入、offer、answer和ICE候选事件
   */
  useEffect(() => {
    if (!socket || !rtcConnection) return;

    /**
     * 处理新用户加入事件
     * @param {string} userId - 新加入用户的ID
     */
    const handleUserJoined = async (userId: string) => {
      logger.info('Room', '新用户加入房间:', { userId });
      
      try {
        // 设置远程对等方ID
        rtcConnection.setRemotePeerId(userId);
        
        // 创建并发送offer
        logger.info('Room', '创建 Offer...');
        const offer = await rtcConnection.createOffer();
        logger.info('Room', '发送 Offer 给用户:', { userId });
        socket.emit('offer', { to: userId, offer });
      } catch (err) {
        logger.error('Room', '处理用户加入失败:', formatError(err));
      }
    };

    /**
     * 处理收到的offer
     * @param {SignalingData} data - offer数据
     */
    const handleOffer = async ({ from, offer }: SignalingData) => {
      if (!offer) return;
      
      logger.info('Room', '收到来自用户的 Offer:', { from });
      try {
        rtcConnection.setRemotePeerId(from);
        const answer = await rtcConnection.handleOffer(offer);
        logger.info('Room', '发送 Answer 给用户:', { from });
        socket.emit('answer', { to: from, answer });
      } catch (err) {
        logger.error('Room', '处理 Offer 失败:', formatError(err));
      }
    };

    /**
     * 处理收到的answer
     * @param {SignalingData} data - answer数据
     */
    const handleAnswer = async ({ from, answer }: SignalingData) => {
      if (!answer) return;
      
      logger.info('Room', '收到来自用户的 Answer:', { from });
      try {
        await rtcConnection.handleAnswer(answer);
        logger.info('Room', 'Answer 处理成功');
      } catch (err) {
        logger.error('Room', '处理 Answer 失败:', formatError(err));
      }
    };

    /**
     * 处理ICE候选
     * @param {SignalingData} data - ICE候选数据
     */
    const handleIceCandidate = async ({ from, candidate }: SignalingData) => {
      if (!candidate) return;
      
      logger.info('Room', '收到 ICE 候选:', { from });
      try {
        await rtcConnection.handleIceCandidate(candidate);
        logger.info('Room', 'ICE 候选处理成功');
      } catch (err) {
        logger.error('Room', '处理 ICE 候选失败:', formatError(err));
      }
    };

    // 设置ICE候选处理器
    rtcConnection.setIceCandidateHandler((candidate: RTCIceCandidateInit) => {
      const remotePeerId = rtcConnection.getRemotePeerId();
      if (remotePeerId) {
        logger.info('Room', '发送 ICE 候选给用户:', remotePeerId);
        socket.emit('ice-candidate', { to: remotePeerId, candidate });
      }
    });

    // 注册信令事件监听器
    socket.on('user-joined', handleUserJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
    };
  }, [rtcConnection]);

  /**
   * 房间事件处理
   * 处理房间信息更新和错误事件
   */
  useEffect(() => {
    const handleRoomInfo = (info: RoomInfo) => {
      logger.info('Room', '收到房间信息:', {
        roomInfo: {
          participants: info.participants,
        }
      });
      
      if (info.participants.length > 1) {
        logger.info('Room', '房间中的其他参与者:', {
          participants: info.participants.filter(id => id !== socket.id)
        });
      }
    };

    const handleSocketError = (error: SocketError) => {
      logger.error('Room', 'Socket 错误:', {
        error: {
          message: error.message
        }
      });
      setError(error.message);
    };

    socket.on('room-info', handleRoomInfo);
    socket.on('error', handleSocketError);

    return () => {
      socket.off('room-info', handleRoomInfo);
      socket.off('error', handleSocketError);
    };
  }, [setError]);

  // 渲染组件
  return (
    <div className="space-y-4">
      <DeviceSelect />
      
      <RoomControls 
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />

      {error && (
        <div className="text-red-500 p-2 bg-red-50 rounded">
          错误: {error}
        </div>
      )}

      {roomId && (
        <div className="mb-4 p-2 bg-gray-100 rounded">
          房间ID: {roomId}
        </div>
      )}

      <VideoGrid 
        localStream={localStream}
        remoteStream={remoteStream}
      />

      <MediaControls />
    </div>
  );
} 