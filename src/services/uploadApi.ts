import { api } from './api';
// verbatimModuleSyntax 옵션에 대응하기 위해 import type 키워드를 사용합니다.
import type { PresignedUrlRequest, PresignedUrlResponse, UploadVerifyRequest } from '../types/upload';

export const uploadApi = {
  /** 1. S3 Direct 업로드를 위한 단기 Presigned URL 발급 요청 */
  getPresignedUrl: async (data: PresignedUrlRequest): Promise<PresignedUrlResponse> => {
    const response = await api.post('/api/v1/uploads/presigned-url', data);
    return response.data;
  },

  /** 2. S3 Object Storage 바이너리 Direct Upload 및 진행률 추적 */
  uploadToS3Direct: async (
    url: string,
    file: File,
    headers: Record<string, string>,
    onProgress: (progress: number) => void
  ): Promise<void> => {
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

  /** 3. 업로드 완료 서버 검증 요청 */
  verifyUpload: async (data: UploadVerifyRequest): Promise<void> => {
    await api.post('/api/v1/uploads/verify', data);
  },
};