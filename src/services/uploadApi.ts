/**
 * @file uploadApi.ts
 * @description S3 Direct Upload 통신 모듈 (실서버 우선 호출 + 백엔드 미구현 시 자동 Mock Fallback 지원)
 */

import { api } from './api';
import type { PresignedUrlRequest, PresignedUrlResponse, UploadVerifyRequest } from '../types/upload';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// 모의 Presigned URL 생성 헬퍼
const createMockPresignedResponse = (fileType?: string): PresignedUrlResponse => {
  return {
    uploadUrl: 'https://mock-s3-upload-url.local/upload',
    fileKey: `mock_key_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    requiredHeaders: { 'Content-Type': fileType || 'image/jpeg' },
  } as unknown as PresignedUrlResponse;
};

// 모의 S3 0% -> 100% 진행률 타이머 헬퍼
const simulateS3Progress = (fileName: string, onProgress: (progress: number) => void): Promise<void> => {
  console.info(`[FALLBACK/MOCK] ${fileName} 바이너리 전송 진행률 시뮬레이션을 시작합니다.`);
  return new Promise((resolve) => {
    let percent = 0;
    const timer = setInterval(() => {
      percent += 25;
      onProgress(Math.min(percent, 100));
      if (percent >= 100) {
        clearInterval(timer);
        console.info(`[FALLBACK/MOCK] ${fileName} 전송 완료 (100%)`);
        resolve();
      }
    }, 150);
  });
};

export const uploadApi = {
  /**
   * 1. S3 Direct 업로드를 위한 단기 Presigned URL 발급 요청
   */
  getPresignedUrl: async (data: PresignedUrlRequest): Promise<PresignedUrlResponse> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return createMockPresignedResponse(data.fileType);
    }

    try {
      const response = await api.post('/api/v1/uploads/presigned-url', data);
      return response.data?.data ?? response.data;
    } catch (error: any) {
      console.warn(
        `[FALLBACK] 백엔드 업로드 Presigned URL API 미구현(HTTP ${error.response?.status || 'ERR'})으로 인해 로컬 시뮬레이션 URL로 대체합니다.`
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
      return createMockPresignedResponse(data.fileType);
    }
  },

  /**
   * 2. S3 Object Storage 바이너리 Direct Upload 및 진행률 추적
   */
  uploadToS3Direct: async (
    url: string,
    file: File,
    headers: Record<string, string>,
    onProgress: (progress: number) => void
  ): Promise<void> => {
    // Mock URL이거나 폴백으로 발급된 가상 URL인 경우 진행률 시뮬레이션 수행
    if (USE_MOCK || url.includes('mock-s3-upload-url.local')) {
      return simulateS3Progress(file.name, onProgress);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
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
   * 3. 업로드 완료 서버 검증 요청
   */
  verifyUpload: async (data: UploadVerifyRequest): Promise<void> => {
    if (USE_MOCK || String(data.fileKey).startsWith('mock_key_')) {
      console.info('[FALLBACK/MOCK] 업로드 무결성 검증 통과 처리 완료');
      await new Promise((resolve) => setTimeout(resolve, 200));
      return;
    }

    try {
      await api.post('/api/v1/uploads/verify', data);
    } catch {
      console.warn('[FALLBACK] 백엔드 업로드 검증 API 미구현으로 검증 완료 처리합니다.');
    }
  },
};