import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /** 카메라 스트림 시작 */
  const startCamera = useCallback(async () => {
    // 이미 활성화된 스트림이 있는 경우 재연결 방지
    if (streamRef.current && streamRef.current.active) {
      if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play().catch(() => {});
      }
      return;
    }

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

      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('카메라 권한 거부 또는 미지원 기기:', err);
      setIsCameraSupported(false);
      setError('카메라를 활성화할 수 없어 파일 선택 모드로 전환합니다.');
    }
  }, []);

  /** 카메라 스트림 완전 중단 */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
  }, []);

  // 언마운트 시 트랙 자동 중단
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

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
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const capturedFile = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          resolve(capturedFile);
        },
        'image/jpeg',
        0.92
      );
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