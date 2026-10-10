/** Presigned URL 발급 요청 타입 */
export interface PresignedUrlRequest {
  shareKey: string;
  participantSessionId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  capturedAt: string;
}

/** Presigned URL 발급 응답 타입 */
export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  requiredHeaders: Record<string, string>;
}

/** 업로드 완료 검증 요청 타입 */
export interface UploadVerifyRequest {
  shareKey: string;
  participantSessionId: string;
  fileKey: string;
}