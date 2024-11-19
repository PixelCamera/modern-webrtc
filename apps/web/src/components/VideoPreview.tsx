import { useEffect, useRef, useState } from 'react';

interface VideoPreviewProps {
  className?: string;
}

export function VideoPreview({ className }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('获取摄像头失败:', err);
        setError('无法访问摄像头和麦克风，请确保已授予权限');
      } finally {
        setIsLoading(false);
      }
    }

    const videoElement = videoRef.current;
    setupCamera();

    return () => {
      if (videoElement?.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="text-center p-4">正在加载摄像头...</div>;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={`rounded-lg bg-black ${className}`}
    />
  );
} 