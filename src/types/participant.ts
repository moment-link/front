/**
 * @file participant.ts
 * @description 참가자 파트 및 공통 미디어/세션 데이터 타입 정의
 */

/**
 * 공개 행사 기본 정보 DTO
 */
export interface PublicEventInfo {
  /** 행사 고유 ID (숫자) */
  eventId: number;
  /** 행사 이름 */
  name: string;
  /** 행사 시작 일시 (ISO 8601) */
  startsAt: string;
  /** 행사 종료 일시 (ISO 8601) */
  endsAt: string;
}

/**
 * 참가자 세션 응답 DTO
 */
export interface ParticipantSession {
  /** 세션 고유 ID */
  sessionId: number;
  /** 행사 고유 ID */
  eventId: number;
  /** 세션 만료 일시 (ISO 8601) */
  expiresAt: string;
}

/**
 * 이모지 반응 수 데이터 구조
 */
export interface PhotoReactions {
  heart: number;
  laugh: number;
  fire: number;
  clap: number;
}

/**
 * 공유 앨범 미디어(사진) 단일 항목 DTO
 */
export interface AlbumPhoto {
  /** 미디어 고유 ID (문자열 또는 숫자) */
  id: string | number;
  /** 미디어 이미지 원본/썸네일 URL */
  url: string;
  /** 업로더 닉네임 */
  uploaderName: string;
  /** 사진 촬영/생성 일시 (ISO 8601) */
  capturedAt: string;
  /** 이모지 반응 집계 */
  reactions: PhotoReactions;
  /** 주최자 승인 여부 */
  isApproved: boolean;
  /** 인기 콘텐츠 여부 */
  isPopular?: boolean;
}