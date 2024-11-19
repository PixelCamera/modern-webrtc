import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getMediaDevices } from '../lib/media-utils';

interface Device {
  deviceId: string;
  label: string;
}

export function DeviceSelect() {
  const [videoDevices, setVideoDevices] = useState<Device[]>([]);
  const [audioDevices, setAudioDevices] = useState<Device[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [selectedAudio, setSelectedAudio] = useState<string>('');

  useEffect(() => {
    async function loadDevices() {
      const { videoDevices: vDevices, audioDevices: aDevices } = await getMediaDevices();
      
      setVideoDevices(vDevices.map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `摄像头 ${index + 1}`
      })));
      
      setAudioDevices(aDevices.map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `麦克风 ${index + 1}`
      })));
    }

    loadDevices();
  }, []);

  return (
    <div className="flex gap-4 mb-4">
      <div className="flex-1">
        <label className="text-sm text-gray-500 mb-1 block">摄像头</label>
        <Select value={selectedVideo} onValueChange={setSelectedVideo}>
          <SelectTrigger>
            <SelectValue placeholder="选择摄像头" />
          </SelectTrigger>
          <SelectContent>
            {videoDevices.map(device => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="text-sm text-gray-500 mb-1 block">麦克风</label>
        <Select value={selectedAudio} onValueChange={setSelectedAudio}>
          <SelectTrigger>
            <SelectValue placeholder="选择麦克风" />
          </SelectTrigger>
          <SelectContent>
            {audioDevices.map(device => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 