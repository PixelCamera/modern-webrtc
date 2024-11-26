import { create } from 'zustand';

/**
 * 媒体状态管理接口
 * @interface MediaState
 * @property {MediaStream | null} stream - 当前活跃的媒体流
 * @property {boolean} isVideoEnabled - 视频轨道是否启用
 * @property {boolean} isAudioEnabled - 音频轨道是否启用
 * @property {function} setStream - 设置新的媒体流
 * @property {function} toggleVideo - 切换视频轨道的启用状态
 * @property {function} toggleAudio - 切换音频轨道的启用状态
 */
interface MediaState {
  stream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  setStream: (stream: MediaStream | null) => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
}

/**
 * 创建媒体状态管理Store
 * 使用Zustand管理媒体流和音视频轨道状态
 */
export const useMediaStore = create<MediaState>((set, get) => ({
  // 初始化状态
  stream: null,
  isVideoEnabled: true,
  isAudioEnabled: true,
  
  /**
   * 设置新的媒体流
   * @param {MediaStream | null} stream - 要设置的媒体流
   */
  setStream: (stream) => set({ stream }),
  
  /**
   * 切换视频轨道的启用状态
   * 遍历媒体流中的所有视频轨道并反转其启用状态
   */
  toggleVideo: () => {
    const { stream, isVideoEnabled } = get();
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      set({ isVideoEnabled: !isVideoEnabled });
    }
  },
  
  /**
   * 切换音频轨道的启用状态
   * 遍历媒体流中的所有音频轨道并反转其启用状态
   */
  toggleAudio: () => {
    const { stream, isAudioEnabled } = get();
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      set({ isAudioEnabled: !isAudioEnabled });
    }
  },
}));