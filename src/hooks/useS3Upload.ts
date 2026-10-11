import { useState, useCallback, useEffect } from 'react';
import { uploadApi } from '../services/uploadApi';

export interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  capturedAt: string; // ISO 8601 타임스탬프 (Moment 자동 분류 기준)[cite: 1]
  status: 'ready' | 'uploading' | 'verifying' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

export const useS3Upload = (shareKey: string, participantSessionId: string) => {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  /** 대기열 항목 추가 */
  const addToQueue = useCallback((files: File[]) => {
    const newItems: UploadQueueItem[] = files.map((file) => ({
      // substr -> substring 으로 안전하게 교체
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      capturedAt: new Date().toISOString(),
      status: 'ready',
      progress: 0,
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
      queue.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  /** 전체 Direct S3 업로드 실행 */
  const startUpload = useCallback(async () => {
    if (queue.length === 0 || isUploading) return;
    setIsUploading(true);

    for (const item of queue) {
      if (item.status === 'completed') continue;

      try {
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading', progress: 0 } : q)));

        const { uploadUrl, fileKey, requiredHeaders } = await uploadApi.getPresignedUrl({
          shareKey,
          participantSessionId,
          fileName: item.file.name,
          fileType: item.file.type,
          fileSize: item.file.size,
          capturedAt: item.capturedAt,
        });

        await uploadApi.uploadToS3Direct(uploadUrl, item.file, requiredHeaders, (progress) => {
          setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, progress } : q)));
        });

        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: 'verifying' } : q)));

        await uploadApi.verifyUpload({ shareKey, participantSessionId, fileKey });

        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: 'completed', progress: 100 } : q)));
      } catch (err: any) {
        console.error(`업로드 실패 (${item.file.name}):`, err);
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'failed', error: err.message || '업로드 오류' } : q))
        );
      }
    }

    setIsUploading(false);
  }, [queue, isUploading, shareKey, participantSessionId]);

  return {
    queue,
    isUploading,
    addToQueue,
    removeFromQueue,
    startUpload,
  };
};