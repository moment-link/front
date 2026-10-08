import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  /** 카메라 스트림 시작 */
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsCameraSupported(false);
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // 모바일 브라우저 자동 재생 보장
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('카메라 권한 거부 또는 미지원 기기:', err);
      setIsCameraSupported(false);
      setError('카메라를 활성화할 수 없어 파일 선택 모드로 전환합니다.');
    }
  }, []);

  /** 카메라 스트림 중단 */
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // 컴포넌트 언마운트 시 카메라 트랙 자동으로 중단
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  /** 프레임 캡처 (사진 촬영) */
  const captureFrame = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current) {
        resolve(null);
        return;
      }

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const capturedFile = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        resolve(capturedFile);
      }, 'image/jpeg', 0.92);
    });
  }, []);

  return {
    videoRef,
    stream,
    isCameraSupported,
    error,
    startCamera,
    stopCamera,
    captureFrame,
  };
};