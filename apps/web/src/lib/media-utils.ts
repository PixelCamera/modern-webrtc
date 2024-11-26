import { logger } from './logger';

/**
 * 媒体设备状态接口
 * @interface MediaDevicesState
 * @property {MediaDeviceInfo[]} videoDevices - 可用的视频输入设备列表
 * @property {MediaDeviceInfo[]} audioDevices - 可用的音频输入设备列表
 * @property {string} [error] - 获取设备时的错误信息(如果有)
 */
export interface MediaDevicesState {
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  error?: string;
}

/**
 * 获取系统可用的媒体设备列表
 * 包括视频和音频输入设备
 * 
 * @returns {Promise<MediaDevicesState>} 包含视频和音频设备列表的状态对象
 */
export async function getMediaDevices(): Promise<MediaDevicesState> {
  if (!navigator?.mediaDevices) {
    const error = 'mediaDevices API 不可用';
    logger.error('MediaUtils', error);
    return {
      videoDevices: [],
      audioDevices: [],
      error
    };
  }

  try {
    // 先请求权限
    logger.info('MediaUtils', '请求媒体设备权限...');
    const hasPermissions = await requestMediaPermissions();
    if (!hasPermissions) {
      throw new Error('未获得媒体设备权限');
    }
    
    // 获取设备列表
    logger.info('MediaUtils', '开始获取设备列表...');
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const audioDevices = devices.filter(device => device.kind === 'audioinput');
    
    logger.info('MediaUtils', `获取到 ${devices.length} 个设备:`, {
      devices: devices.map(d => ({
        kind: d.kind,
        label: d.label || '未命名设备',
        id: d.deviceId
      }))
    });

    return {
      videoDevices,
      audioDevices
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取设备列表失败';
    logger.error('MediaUtils', '获取设备列表失败:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : String(error)
    });
    return {
      videoDevices: [],
      audioDevices: [],
      error: errorMessage
    };
  }
}

/**
 * 请求用户授予媒体设备访问权限
 * 通过临时请求音视频流来触发浏览器的权限请求
 * 
 * @returns {Promise<boolean>} 如果成功获取权限返回true，否则返回false
 */
export async function requestMediaPermissions(): Promise<boolean> {
  if (!navigator?.mediaDevices?.getUserMedia) {
    logger.error('MediaUtils', 'getUserMedia API 不可用');
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });
    // 立即停止获取的媒体流，因为我们只是为了请求权限
    stopMediaStream(stream);
    return true;
  } catch (error) {
    logger.error('MediaUtils', '媒体权限请求失败:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : String(error)
    });
    return false;
  }
}

/**
 * 停止指定的媒体流
 * 遍历并停止流中的所有音视频轨道
 * 
 * @param {MediaStream | null} stream - 要停止的媒体流
 */
export function stopMediaStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach(track => track.stop());
}