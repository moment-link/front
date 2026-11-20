import { useState, useCallback, useEffect, useRef } from 'react';
import { uploadApi } from '../services/uploadApi';

export interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  capturedAt: string; // ISO 8601 타임스탬프[cite: 1]
  status: 'ready' | 'uploading' | 'verifying' | 'completed' | 'failed';
  progress: number;
  mediaId?: number;
  prepareIdempotencyKey: string;
  completeIdempotencyKey: string;
  error?: string;
}

const createIdempotencyKey = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

/**
 * 파일의 SHA-256 체크섬을 백엔드 규격(원본 32바이트 표준 Base64)으로 계산합니다.
 */
const calculateSha256Base64 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const bytes = new Uint8Array(hashBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const useS3Upload = (eventId: number | string) => {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const queueRef = useRef<UploadQueueItem[]>([]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  /** 대기열 항목 추가 */
  const addToQueue = useCallback((files: File[]) => {
    const newItems: UploadQueueItem[] = files.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      capturedAt: new Date().toISOString(),
      status: 'ready',
      progress: 0,
      prepareIdempotencyKey: createIdempotencyKey('prep'),
      completeIdempotencyKey: createIdempotencyKey('comp'),
    }));

    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  /** 대기열 항목 제거 */
  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => {
      const item = prev.find((q) => q.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((q) => q.id !== id);
    });
  }, []);

  // 언마운트 시 잔여 Blob URL 메모리 해제
  useEffect(() => {
    return () => {
      queueRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  /** 전체 Direct S3 업로드 실행 */
  const startUpload = useCallback(async () => {
    const numericEventId = Number(eventId);
    if (!numericEventId || queue.length === 0 || isUploading) return;

    setIsUploading(true);

    for (const item of queue) {
      if (item.status === 'completed') continue;

      try {
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', progress: 0, error: undefined } : q))
        );

        const checksum = await calculateSha256Base64(item.file);
        const mediaType: 'IMAGE' | 'VIDEO' = item.file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
        const normalizedMimeType = (item.file.type || (mediaType === 'VIDEO' ? 'video/mp4' : 'image/jpeg'))
          .split(';')[0]
          .trim()
          .toLowerCase();

        // 1. 업로드 준비 (/prepare) -> mediaId 및 upload 타겟 정보 수신
        const prepared = await uploadApi.prepareUpload(
          numericEventId,
          {
            fileName: item.file.name,
            mediaType,
            mimeType: normalizedMimeType,
            sizeBytes: item.file.size,
            checksum,
            capturedAt: item.capturedAt,
          },
          item.prepareIdempotencyKey
        );

        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, mediaId: prepared.mediaId } : q))
        );

        // 2. S3 Presigned URL로 직접 PUT 전송
        await uploadApi.uploadToS3Direct(
          prepared.upload.url,
          item.file,
          prepared.upload.headers || {},
          (progress) => {
            setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, progress } : q)));
          }
        );

        // 3. 업로드 완료 검증 (/{mediaId}/complete)
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: 'verifying' } : q)));

        await uploadApi.completeUpload(
          numericEventId,
          prepared.mediaId,
          item.completeIdempotencyKey
        );

        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'completed', progress: 100 } : q))
        );
      } catch (err: any) {
        console.error(`업로드 실패 (${item.file.name}):`, err);
        const message =
          err?.response?.data?.message ||
          err?.message ||
          '업로드 처리 중 오류가 발생했습니다.';
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'failed', error: message } : q))
        );
      }
    }

    setIsUploading(false);
  }, [eventId, queue, isUploading]);

  return {
    queue,
    isUploading,
    addToQueue,
    removeFromQueue,
    startUpload,
  };
};