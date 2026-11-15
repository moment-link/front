/**
 * @file useCamera.ts
 * @description WebRTC 기반 카메라 스트림 및 MediaRecorder 동영상 녹화 관리 커스텀 훅 (기본 카메라 복귀 시 자동 재연결 로직 포함)
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  /** 카메라 스트림 시작 (재호출 시 기존 스트림 정리 후 안전 재연결) */
  const startCamera = useCallback(async () => {
    // 이미 활성화된 유효한 스트림이 있는 경우
    if (streamRef.current && streamRef.current.active) {
      if (videoRef.current && videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play().catch(() => {});
      }
      return true;
    }

    try {
      setError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsCameraSupported(false);
        return false;
      }

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: true,
        });
      } catch {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsCameraSupported(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
      return true;
    } catch (err: any) {
      console.warn('카메라 권한 거부 또는 HTTPS 미적용 환경:', err);
      setIsCameraSupported(false);
      setError('카메라를 활성화할 수 없습니다.');
      return false;
    }
  }, []);

  useEffect(() => {
    if (stream && videoRef.current && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  /**
   * [핵심 보완] 사용자가 기본 카메라로 전환했다가 돌아왔을 때(브라우저 탭 포커스 복귀 등),
   * 카메라 스트림이 죽어있다면 자동으로 재연결을 시도합니다.
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!streamRef.current || !streamRef.current.active) {
          console.info('[useCamera] 브라우저 포커스 복귀 감지: 카메라 스트림을 재연결합니다.');
          startCamera();
        }
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [startCamera]);

  /** 카메라 스트림 완전 중단 */
  const stopCamera = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setStream(null);
  }, []);

  // 언마운트 시 트랙 자동 중단
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  /** 프레임 캡처 (사진 촬영) */
  const captureFrame = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !streamRef.current) {
        resolve(null);
        return;
      }

      const video = videoRef.current;
      const width = video.videoWidth || 1920;
      const height = video.videoHeight || 1080;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.drawImage(video, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          resolve(
            new File([blob], `IMG_${Date.now()}.jpg`, {
              type: 'image/jpeg',
            })
          );
        },
        'image/jpeg',
        0.92
      );
    });
  }, []);

  /** 동영상 녹화 시작 */
  const startRecording = useCallback(() => {
    if (!streamRef.current || isRecording) return;

    recordedChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    try {
      const recorder = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('동영상 녹화 시작 실패:', err);
    }
  }, [isRecording]);

  /** 동영상 녹화 종료 및 File 객체 반환 */
  const stopRecording = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(null);
        return;
      }

      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'video/mp4';
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const videoBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        const videoFile = new File([videoBlob], `VID_${Date.now()}.${ext}`, {
          type: mimeType,
        });
        setIsRecording(false);
        setRecordingSeconds(0);
        resolve(videoFile);
      };

      recorder.stop();
    });
  }, []);

  return {
    videoRef,
    stream,
    isCameraSupported,
    isRecording,
    recordingSeconds,
    error,
    startCamera,
    stopCamera,
    captureFrame,
    startRecording,
    stopRecording,
  };
};