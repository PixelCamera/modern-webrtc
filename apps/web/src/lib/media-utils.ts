export async function getMediaDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  
  return {
    videoDevices: devices.filter(device => device.kind === 'videoinput'),
    audioDevices: devices.filter(device => device.kind === 'audioinput'),
  };
}

export async function requestMediaPermissions() {
  try {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    return true;
  } catch (error) {
    console.error('媒体权限请求失败:', error);
    return false;
  }
}

export function stopMediaStream(stream: MediaStream | null) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
} 