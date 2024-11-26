/**
 * WebRTC 连接管理模块
 * 提供 WebRTC 点对点连接的建立、维护和管理功能
 * @module webrtc
 */

import { logger } from './logger';
import { WebRTCError } from './errors';
import { formatError } from './utils';

/**
 * ICE Candidate 处理器函数类型
 * 用于处理新发现的 ICE 候选者
 */
export type IceCandidateHandler = (candidate: RTCIceCandidateInit) => void;

/**
 * WebRTC 连接管理类
 * 负责管理单个 WebRTC 点对点连接的完整生命周期
 */
export class WebRTCConnection {
  /** WebRTC 对等连接实例 */
  private peerConnection: RTCPeerConnection;
  
  /** 本地音视频流 */
  private localStream: MediaStream | null = null;
  
  /** 远程对等端唯一标识 */
  private remotePeerId: string | null = null;
  
  /** 远程流处理回调函数 */
  private onRemoteStream: (stream: MediaStream) => void;
  
  /** ICE 候选者处理回调函数 */
  private iceCandidateHandler: IceCandidateHandler | null = null;

  /**
   * 创建 WebRTC 连接实例
   * @param onRemoteStream - 接收到远程流时的回调函数
   */
  constructor(onRemoteStream: (stream: MediaStream) => void) {
    // 初始化 RTCPeerConnection，配置 STUN 服务器
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
          ],
        },
      ],
    });

    this.onRemoteStream = onRemoteStream;

    // 处理远程媒体流事件
    this.peerConnection.ontrack = (event) => {
      logger.info('WebRTC', '收到远程媒体流');
      this.onRemoteStream(event.streams[0]);
    };

    // 处理 ICE 候选者事件
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        logger.debug('WebRTC', '发现新的 ICE candidate');
        this.iceCandidateHandler?.(event.candidate.toJSON());
      }
    };

    // 监控连接状态变化
    this.peerConnection.onconnectionstatechange = () => {
      logger.info('WebRTC', '连接状态变更', {
        state: this.peerConnection.connectionState
      });
    };

    // 监控 ICE 连接状态变化
    this.peerConnection.oniceconnectionstatechange = () => {
      logger.info('WebRTC', 'ICE 连接状态变更', {
        state: this.peerConnection.iceConnectionState
      });
    };
  }

  /**
   * 设置远程对等端标识
   * @param peerId - 远程对等端的唯一标识
   */
  setRemotePeerId(peerId: string) {
    this.remotePeerId = peerId;
    logger.debug('WebRTC', '设置远程 Peer ID', { peerId });
  }

  /**
   * 获取远程对等端标识
   * @returns 远程对等端标识，未设置时返回 null
   */
  getRemotePeerId(): string | null {
    return this.remotePeerId;
  }

  /**
   * 设置本地媒体流
   * 将音视频轨道添加到对等连接中
   * @param stream - 本地音视频流
   * @throws {WebRTCError} 添加媒体轨道失败时抛出
   */
  async setLocalStream(stream: MediaStream) {
    try {
      this.localStream = stream;
      stream.getTracks().forEach(track => {
        if (this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
      logger.info('WebRTC', '已设置本地媒体流', {
        tracks: stream.getTracks().length
      });
    } catch (error) {
      logger.error('WebRTC', '设置本地媒体流失败', formatError(error));
      throw new WebRTCError('设置本地媒体流失败', 'SET_LOCAL_STREAM_FAILED');
    }
  }

  /**
   * 创建并设置连接 Offer
   * 用于发起 WebRTC 连接
   * @returns 生成的 Offer 会话描述
   * @throws {WebRTCError} 创建或设置 Offer 失败时抛出
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      logger.info('WebRTC', '创建 Offer 成功');
      return offer;
    } catch (error) {
      logger.error('WebRTC', '创建 Offer 失败', formatError(error));
      throw new WebRTCError('创建 Offer 失败', 'CREATE_OFFER_FAILED');
    }
  }

  /**
   * 处理接收到的 Offer 并创建 Answer
   * 用于响应连接请求
   * @param offer - 接收到的 Offer 会话描述
   * @returns 生成的 Answer 会话描述
   * @throws {WebRTCError} 处理 Offer 或创建 Answer 失败时抛出
   */
  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      logger.info('WebRTC', '处理 Offer 并创建 Answer 成功');
      return answer;
    } catch (error) {
      logger.error('WebRTC', '处理 Offer 失败', formatError(error));
      throw new WebRTCError('处理 Offer 失败', 'HANDLE_OFFER_FAILED');
    }
  }

  /**
   * 处理接收到的 Answer
   * 完成连接的建立
   * @param answer - 接收到的 Answer 会话描述
   * @throws {WebRTCError} 设置远程描述失败时抛出
   */
  async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      logger.info('WebRTC', '处理 Answer 成功');
    } catch (error) {
      logger.error('WebRTC', '处理 Answer 失败', formatError(error));
      throw new WebRTCError('处理 Answer 失败', 'HANDLE_ANSWER_FAILED');
    }
  }

  /**
   * 处理接收到的 ICE 候选者
   * 添加新的网络连接路径
   * @param candidate - ICE 候选者信息
   * @throws {WebRTCError} 添加候选者失败时抛出
   */
  async handleIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      logger.debug('WebRTC', '添加 ICE candidate 成功');
    } catch (error) {
      logger.error('WebRTC', '添加 ICE candidate 失败', formatError(error));
      throw new WebRTCError('添加 ICE candidate 失败', 'ADD_ICE_CANDIDATE_FAILED');
    }
  }

  /**
   * 设置 ICE 候选者处理器
   * 用于处理新发现的网络连接路径
   * @param handler - ICE 候选者处理回调函数
   */
  public setIceCandidateHandler(handler: IceCandidateHandler): void {
    this.iceCandidateHandler = handler;
    logger.debug('WebRTC', '设置 ICE candidate 处理器');
  }

  /**
   * 清理连接资源
   * 停止所有媒体轨道并关闭连接
   */
  cleanup() {
    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
      }
      this.peerConnection.close();
      logger.info('WebRTC', '清理资源完成');
    } catch (error) {
      logger.error('WebRTC', '清理资源时发生错误', formatError(error));
    }
  }
}