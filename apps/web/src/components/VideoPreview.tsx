import { useEffect, useRef } from 'react';
import { logger } from '../lib/logger';
import { formatError } from '../lib/utils';

/**
 * 视频预览组件的属性类型定义
 * @interface VideoPreviewProps
 * @property {MediaStream} [stream] - 要显示的媒体流
 * @property {string} [className] - 自定义CSS类名
 * @property {Function} [onStreamReady] - 流准备就绪时的回调函数
 */
interface VideoPreviewProps {
  stream?: MediaStream | null;
  className?: string;
  onStreamReady?: (stream: MediaStream) => void;
}

/**
 * 视频预览组件
 * 用于实时显示和控制视频流的播放
 * 
 * @component
 * @param {VideoPreviewProps} props - 组件属性
 * @returns {JSX.Element} 视频预览组件
 */
export function VideoPreview({ stream, className, onStreamReady }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mountedRef = useRef(true);
  const playAttemptRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamIdRef = useRef<string | null>(null);

  /**
   * 管理组件的挂载状态
   * 在组件卸载时清理状态
   */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * 处理视频流的设置和播放
   * 当stream发生变化时重新设置视频源并尝试播放
   */
  useEffect(() => {
    if (stream?.id === streamIdRef.current) {
      return;
    }

    logger.info('VideoPreview', `effect 运行, stream: ${stream?.id}`);
    const videoElement = videoRef.current;
    if (!videoElement || !stream) {
      logger.info('VideoPreview', '没有视频元素或流，退出effect');
      return;
    }

    streamIdRef.current = stream.id;
    
    /**
     * 设置视频源并尝试播放的异步函数
     * 包含错误处理和状态检查
     */
    const setupVideo = async () => {
      if (!mountedRef.current) return;
      
      logger.info('VideoPreview', '设置视频源...');
      videoElement.srcObject = stream;
      
      try {
        // 清除之前的播放尝试
        if (playAttemptRef.current) {
          clearTimeout(playAttemptRef.current);
        }
        
        // 延迟100ms后尝试播放，避免潜在的时序问题
        playAttemptRef.current = setTimeout(async () => {
          if (!mountedRef.current) return;
          
          try {
            await videoElement.play();
            logger.info('VideoPreview', '视频开始播放');
            if (mountedRef.current) {
              onStreamReady?.(stream);
            }
          } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
              logger.error('VideoPreview', '视频播放失败:', formatError(error));
            }
          }
        }, 100);
      } catch (error) {
        logger.error('VideoPreview', '视频设置失败:', formatError(error));
      }
    };

    void setupVideo();

    /**
     * 清理函数
     * 清除定时器、重置视频源和streamId
     */
    return () => {
      if (playAttemptRef.current) {
        clearTimeout(playAttemptRef.current);
      }
      logger.info('VideoPreview', '清理VideoPreview effect');
      if (videoElement.srcObject) {
        videoElement.srcObject = null;
      }
      streamIdRef.current = null;
    };
  }, [stream, onStreamReady]);

  return (
    <div className="relative">
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
          等待视频流...
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full rounded-lg bg-black ${className}`}
      />
    </div>
  );
}