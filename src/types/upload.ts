/**
 * S3 Direct Upload용 Presigned URL 발급 요청 DTO
 */
export interface PresignedUrlRequest {
  /** 행사 공유 키 */
  shareKey: string;
  /** 참가자 세션 ID */
  participantSessionId: string;
  /** 업로드할 이미지/미디어 파일명 */
  fileName: string;
  /** 파일 MIME 타입 (예: 'image/jpeg', 'image/png') */
  fileType: string;
  /** 파일 크기 (바이트 단위) */
  fileSize: number;
  /** EXIF/촬영 시각 (ISO 8601 문자열) */
  capturedAt: string;
}

/**
 * S3 Direct Upload용 Presigned URL 발급 응답 DTO
 */
export interface PresignedUrlResponse {
  /** S3 Direct Upload용 PUT URL */
  uploadUrl: string;
  /** S3 저장소 내 파일 오브젝트 Key */
  fileKey: string;
  /** S3 PUT 요청 시 필수로 첨부해야 하는 HTTP 헤더 객체 */
  requiredHeaders: Record<string, string>;
}

/**
 * S3 파일 업로드 완료 후 서버 検証(Verify) 요청 DTO
 */
export interface UploadVerifyRequest {
  /** 행사 공유 키 */
  shareKey: string;
  /** 참가자 세션 ID */
  participantSessionId: string;
  /** 업로드 완료된 S3 파일 Key */
  fileKey: string;
}