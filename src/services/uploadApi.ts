/**
 * @file uploadApi.ts
 * @description 백엔드 MediaUploadController 규격 기반 S3 Direct Upload 통신 모듈
 */

import { api } from './api';

export interface PrepareUploadRequest {
  fileName: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mimeType: string;
  sizeBytes: number;
  checksum: string; // SHA-256 32바이트 표준 Base64
  capturedAt?: string; // ISO 8601 문자열
}

export interface UploadTargetInfo {
  method: string;
  url: string;
  expiresAt: string;
  headers: Record<string, string>;
}

export interface PrepareUploadResponse {
  mediaId: number;
  uploadStatus: string;
  upload: UploadTargetInfo;
}

export interface CompleteUploadResponse {
  mediaId: number;
  uploadStatus: string;
  publicationStatus: string;
  uploadedAt: string | null;
}

export const uploadApi = {
  /**
   * 1. 업로드 준비 (S3 Presigned URL 및 mediaId 발급)
   * POST /api/v1/participant/{eventId}/media/prepare
   */
  prepareUpload: async (
    eventId: number,
    payload: PrepareUploadRequest,
    idempotencyKey: string
  ): Promise<PrepareUploadResponse> => {
    const response = await api.post(
      `/api/v1/participant/${eventId}/media/prepare`,
      payload,
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      }
    );
    return response.data?.data ?? response.data;
  },

  /**
   * 2. S3 Object Storage 바이너리 Direct PUT 업로드 및 진행률 추적
   */
  uploadToS3Direct: async (
    url: string,
    file: File,
    headers: Record<string, string>,
    onProgress: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);

      Object.entries(headers || {}).forEach(([key, value]) => {
        if (value) {
          xhr.setRequestHeader(key, value);
        }
      });

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`S3 업로드 실패: HTTP 상태 코드 ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('S3 업로드 네트워크 오류가 발생했습니다.'));
      xhr.send(file);
    });
  },

  /**
   * 3. 업로드 완료 검증 요청
   * POST /api/v1/participant/{eventId}/media/{mediaId}/complete
   */
  completeUpload: async (
    eventId: number,
    mediaId: number,
    idempotencyKey: string
  ): Promise<CompleteUploadResponse> => {
    const response = await api.post(
      `/api/v1/participant/${eventId}/media/${mediaId}/complete`,
      {},
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      }
    );
    return response.data?.data ?? response.data;
  },
};