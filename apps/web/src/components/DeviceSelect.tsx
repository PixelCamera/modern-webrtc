import { useEffect, useState, useCallback } from 'react';
import type { ReactElement } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { logger } from '../lib/logger';
import { getMediaDevices } from '../lib/media-utils';

/** 
 * 媒体设备类型常量
 * @constant
 */
const DEVICE_TYPES = {
  /** 视频输入设备,如摄像头 */
  VIDEO_INPUT: 'videoinput' as const,
  /** 音频输入设备,如麦克风 */
  AUDIO_INPUT: 'audioinput' as const,
  /** 音频输出设备,如扬声器 */
  AUDIO_OUTPUT: 'audiooutput' as const,
} as const;

/**
 * 设备类型的显示名称映射
 * @constant
 */
const DEVICE_TYPE_LABELS = {
  [DEVICE_TYPES.VIDEO_INPUT]: '视频',
  [DEVICE_TYPES.AUDIO_INPUT]: '音频', 
  [DEVICE_TYPES.AUDIO_OUTPUT]: '扬声器',
} as const;

/**
 * DeviceSelect组件的属性类型定义
 * @interface
 */
interface DeviceSelectProps {
  /** 视频设备变更的回调函数 */
  onVideoDeviceChange?: (deviceId: string) => void;
  /** 音频设备变更的回调函数 */
  onAudioDeviceChange?: (deviceId: string) => void;
  /** 默认选中的视频设备ID */
  defaultVideoDevice?: string;
  /** 默认选中的音频设备ID */
  defaultAudioDevice?: string;
}

/**
 * 单个设备选择器的属性类型定义
 * @interface
 */
interface DeviceSelectorProps {
  /** 可选择的设备列表 */
  devices: MediaDeviceInfo[];
  /** 当前选中的设备ID */
  selectedDevice: string;
  /** 设备选择变更的回调函数 */
  onValueChange: (value: string) => void;
  /** 选择器的占位提示文本 */
  placeholder: string;
  /** 设备类型 */
  type: keyof typeof DEVICE_TYPE_LABELS;
  /** 错误信息 */
  error?: string;
}

/**
 * 单个设备选择器组件
 * 用于选择特定类型(音频/视频)的媒体设备
 * 
 * @param props - 组件属性
 * @returns 设备选择器UI组件
 */
const DeviceSelector = ({ 
  devices, 
  selectedDevice, 
  onValueChange, 
  placeholder,
  type,
  error
}: DeviceSelectorProps): ReactElement => (
  <div className="flex-1">
    <Select
      value={selectedDevice}
      onValueChange={onValueChange}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {devices.length > 0 ? (
          devices.map(device => (
            <SelectItem 
              key={device.deviceId} 
              value={device.deviceId || 'default'}
            >
              {device.label || `${DEVICE_TYPE_LABELS[type]}设备 ${device.deviceId.slice(0, 8)}`}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-device">
            {error || `没有可用的${DEVICE_TYPE_LABELS[type]}设备`}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  </div>
);

/**
 * 设备选择组件
 * 提供音频和视频设备的选择功能,支持设备变更监听和错误处理
 * 
 * @param props - 组件属性
 * @returns 完整的设备选择UI组件
 */
export function DeviceSelect({
  onVideoDeviceChange,
  onAudioDeviceChange,
  defaultVideoDevice = '',
  defaultAudioDevice = '',
}: DeviceSelectProps): ReactElement {
  // 设备列表和选中状态
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState(defaultVideoDevice);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState(defaultAudioDevice);
  const [error, setError] = useState<string>('');

  /**
   * 获取并更新可用的媒体设备列表
   * 处理可能出现的错误情况
   */
  const updateDevices = useCallback(async () => {
    const { videoDevices, audioDevices, error } = await getMediaDevices();
    setDevices([...videoDevices, ...audioDevices]);
    if (error) {
      setError(error);
    }
  }, []);

  // 初始化设备列表并监听设备变更
  useEffect(() => {
    void updateDevices();
    
    const handleDeviceChange = () => {
      void updateDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [updateDevices]);

  /**
   * 处理视频设备选择变更
   * @param deviceId - 新选择的视频设备ID
   */
  const handleVideoDeviceChange = useCallback((deviceId: string) => {
    logger.info('DeviceSelect', '视频设备变更:', deviceId);
    setSelectedVideoDevice(deviceId);
    onVideoDeviceChange?.(deviceId);
  }, [onVideoDeviceChange]);

  /**
   * 处理音频设备选择变更
   * @param deviceId - 新选择的音频设备ID
   */
  const handleAudioDeviceChange = useCallback((deviceId: string) => {
    logger.info('DeviceSelect', '音频设备变更:', deviceId);
    setSelectedAudioDevice(deviceId);
    onAudioDeviceChange?.(deviceId);
  }, [onAudioDeviceChange]);

  // 按类型过滤设备列表
  const videoDevices = devices.filter(device => 
    device.kind === DEVICE_TYPES.VIDEO_INPUT
  );
  const audioDevices = devices.filter(device => 
    device.kind === DEVICE_TYPES.AUDIO_INPUT
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-4">
        <DeviceSelector
          devices={videoDevices}
          selectedDevice={selectedVideoDevice}
          onValueChange={handleVideoDeviceChange}
          placeholder="选择视频设备"
          type={DEVICE_TYPES.VIDEO_INPUT}
          error={error}
        />
        <DeviceSelector
          devices={audioDevices}
          selectedDevice={selectedAudioDevice}
          onValueChange={handleAudioDeviceChange}
          placeholder="选择音频设备"
          type={DEVICE_TYPES.AUDIO_INPUT}
          error={error}
        />
      </div>
    </div>
  );
} 