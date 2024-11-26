import { useMediaStore } from '../lib/stores/mediaStore';
import { Button } from './ui/button';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

/**
 * 媒体控制组件
 * 
 * 提供视频和音频的开关控制功能，包括:
 * - 视频开关切换按钮
 * - 音频开关切换按钮
 * 
 * 组件状态通过 mediaStore 进行管理
 */
export function MediaControls() {
  // 从 mediaStore 获取媒体状态和控制函数
  const { 
    isVideoEnabled, // 视频启用状态
    isAudioEnabled, // 音频启用状态
    toggleVideo,    // 切换视频状态函数
    toggleAudio     // 切换音频状态函数
  } = useMediaStore();

  return (
    <div className="flex gap-2 justify-center mt-4">
      {/* 视频控制按钮: 点击切换视频开关状态，禁用时显示红色背景和图标 */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleVideo}
        className={!isVideoEnabled ? 'bg-red-100' : ''}
      >
        {isVideoEnabled ? <Video /> : <VideoOff className="text-red-500" />}
      </Button>

      {/* 音频控制按钮: 点击切换音频开关状态，禁用时显示红色背景和图标 */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleAudio}
        className={!isAudioEnabled ? 'bg-red-100' : ''}
      >
        {isAudioEnabled ? <Mic /> : <MicOff className="text-red-500" />}
      </Button>
    </div>
  );
}