import { create } from 'zustand';

interface MediaState {
  stream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  setStream: (stream: MediaStream | null) => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
}

export const useMediaStore = create<MediaState>((set, get) => ({
  stream: null,
  isVideoEnabled: true,
  isAudioEnabled: true,
  
  setStream: (stream) => set({ stream }),
  
  toggleVideo: () => {
    const { stream, isVideoEnabled } = get();
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      set({ isVideoEnabled: !isVideoEnabled });
    }
  },
  
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