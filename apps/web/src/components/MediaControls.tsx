import { useMediaStore } from '../lib/stores/mediaStore';
import { Button } from './ui/button';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

export function MediaControls() {
  const { isVideoEnabled, isAudioEnabled, toggleVideo, toggleAudio } = useMediaStore();

  return (
    <div className="flex gap-2 justify-center mt-4">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleVideo}
        className={!isVideoEnabled ? 'bg-red-100' : ''}
      >
        {isVideoEnabled ? <Video /> : <VideoOff className="text-red-500" />}
      </Button>

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