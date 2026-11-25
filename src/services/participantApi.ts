/**
 * @file participantApi.ts
 * @description MomentLink 참가자 파트 백엔드 실서버 연동 서비스 (1학기 범위: P-01 ~ P-06)
 * @note
 * - 인증 방식: POST /session 호출 시 서버가 발급하는 HttpOnly 쿠키(participant_token) 자동 전송
 * - 환경 분기: VITE_USE_MOCK === 'true' 일 때만 로컬 Mock 응답 반환, 기본값은 실서버 REST API 호출
 */

import { api } from './api';
import type { PublicEventInfo, ParticipantSession, AlbumPhoto } from '../types/participant';

export type { PublicEventInfo, ParticipantSession, AlbumPhoto };

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ============================================================================
// 백엔드 응답 DTO 타입 정의
// ============================================================================

export interface GalleryItemDto {
  mediaId: number;
  mediaType: 'IMAGE' | 'VIDEO' | string;
  thumbnailUrl: string | null;
  capturedAt: string | null;
  uploadedAt: string | null;
  uploaderDisplayName: string;
  likeCount: number;
  likedByMe: boolean;
  isMine: boolean;
}

export interface GalleryDetailDto extends GalleryItemDto {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  mediaUrl: string | null;
  urlExpiresAt: string | null;
}

export interface LikeResponseDto {
  mediaId: number;
  likedByMe: boolean;
  likeCount: number;
}

export interface MomentMediaPreviewDto {
  mediaId: number;
  mediaType?: 'IMAGE' | 'VIDEO' | string;
  thumbnailUrl?: string | null;
}

export interface ParticipantMomentDto {
  momentId: number | string;
  title: string;
  description?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  location?: string | null;
  mediaCount?: number;
  mediaList?: MomentMediaPreviewDto[];
}

// ============================================================================
// Mock 데이터 및 DTO 매핑 헬퍼
// ============================================================================

const MOCK_EVENT_INFO: PublicEventInfo = {
  eventId: 42,
  name: '2026 가을 워크숍',
  startsAt: '2026-10-02T09:00:00Z',
  endsAt: '2026-10-03T18:00:00Z',
};

const MOCK_ALBUM_PHOTOS: AlbumPhoto[] = [
  {
    id: 'photo_1',
    url: '',
    uploaderName: '민지',
    capturedAt: '2026-10-02T09:12:00Z',
    reactions: { heart: 12, laugh: 3, fire: 8, clap: 1 },
    isApproved: true,
    isPopular: true,
  },
  {
    id: 'photo_2',
    url: '',
    uploaderName: '반짝이는 수달',
    capturedAt: '2026-10-02T09:25:00Z',
    reactions: { heart: 10, laugh: 2, fire: 4, clap: 2 },
    isApproved: true,
    isPopular: false,
  },
];

const sortMockPhotos = (sort: 'latest' | 'popular'): AlbumPhoto[] => {
  const items = [...MOCK_ALBUM_PHOTOS];
  if (sort === 'popular') {
    return items.sort((a, b) => {
      const sumA = Object.values(a.reactions || {}).reduce((acc, cur) => acc + cur, 0);
      const sumB = Object.values(b.reactions || {}).reduce((acc, cur) => acc + cur, 0);
      return sumB - sumA;
    });
  }
  return items;
};

/**
 * 백엔드 GalleryItemDto를 프론트엔드 공용 AlbumPhoto 모델로 변환합니다.
 * @note 백엔드 1학기 스펙은 단일 좋아요(likeCount, likedByMe)를 반환하므로 reactions.heart에 매핑합니다.
 */
const mapGalleryItemToAlbumPhoto = (
  item: GalleryItemDto,
  sort: 'latest' | 'popular'
): AlbumPhoto & { likedByMe?: boolean; mediaType?: string } => {
  const likeCount = Number(item.likeCount ?? 0);
  return {
    id: item.mediaId,
    url: item.thumbnailUrl || '',
    uploaderName: item.uploaderDisplayName || '익명 참가자',
    capturedAt: item.capturedAt || item.uploadedAt || new Date().toISOString(),
    reactions: {
      heart: likeCount,
      laugh: 0,
      fire: 0,
      clap: 0,
    },
    isApproved: true,
    isPopular: sort === 'popular' || likeCount >= 10,
    likedByMe: Boolean(item.likedByMe),
    mediaType: item.mediaType,
  };
};

const extractArrayPayload = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.moments)) return obj.moments as T[];
  }
  return [];
};

// ============================================================================
// P-01: 행사 입장 및 참가자 세션 API
// ============================================================================

/**
 * [개발용] 테스트 행사 및 유효한 접근 키(accessKey)를 발급합니다.
 * @endpoint POST /api/dev/events
 */
export const createDevEvent = async (): Promise<{ eventId: number; accessKey: string } | null> => {
  const response = await api.post('/api/dev/events');
  const data = response.data?.data ?? response.data;
  const accessKey =
    data?.accessKey ||
    data?.shareKey ||
    (typeof data?.publicAccessUrl === 'string'
      ? data.publicAccessUrl.split('/').filter(Boolean).pop()
      : '');

  if (accessKey && data?.eventId) {
    sessionStorage.setItem('currentShareKey', accessKey);
    return { eventId: data.eventId, accessKey };
  }
  return null;
};

/**
 * [P-01] 공유 키(X-Event-Access-Key)로 공개 행사 기본 정보를 조회합니다.
 * @endpoint GET /api/v1/events/access
 * @note
 * - 새 행사 링크로 진입할 때마다 sessionStorage의 currentShareKey를 최신 키로 동기화합니다.
 * - 개발 환경에서 만료/미등록 키로 403 반환 시 dev 이벤트를 자동 발급하여 재시도합니다.
 */
export const getPublicEventInfo = async (shareKey: string): Promise<PublicEventInfo> => {
  if (!shareKey) {
    throw new Error('유효한 공유 키가 요구됩니다.');
  }

  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return MOCK_EVENT_INFO;
  }

  const cleanKey = shareKey.trim();

  try {
    const response = await api.get('/api/v1/events/access', {
      headers: {
        'X-Event-Access-Key': cleanKey,
      },
    });
    const result = response.data?.data ?? response.data;
    if (result && typeof result === 'object' && 'eventId' in result) {
      // 새 공유 링크로 진입할 때마다 이전 행사의 잔존 키를 덮어쓰기
      sessionStorage.setItem('currentShareKey', cleanKey);
      return result as PublicEventInfo;
    }
    throw new Error('유효하지 않은 행사 응답 형식입니다.');
  } catch (error: any) {
    if (error?.response?.status === 403) {
      const devEvent = await createDevEvent();
      if (devEvent?.accessKey) {
        const retryRes = await api.get('/api/v1/events/access', {
          headers: {
            'X-Event-Access-Key': devEvent.accessKey,
          },
        });
        const retryData = retryRes.data?.data ?? retryRes.data;
        if (retryData && typeof retryData === 'object' && 'eventId' in retryData) {
          sessionStorage.setItem('currentShareKey', devEvent.accessKey);
          return retryData as PublicEventInfo;
        }
      }
    }
    throw error;
  }
};

/**
 * [P-01] 참가자 세션을 발급하고 브라우저에 HttpOnly 쿠키(participant_token)를 저장합니다.
 * @endpoint POST /api/v1/participant/{eventId}/session
 * @note 이전 행사 키 잔존으로 인한 403 오류를 방지하기 위해 전달받은 shareKey를 최우선으로 사용합니다.
 */
export const postJoinSession = async (
  eventId: number,
  shareKey: string
): Promise<ParticipantSession> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return {
      sessionId: 2,
      eventId: eventId || 42,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    };
  }

  const activeKey = (shareKey || sessionStorage.getItem('currentShareKey') || '').trim();
  const response = await api.post(
    `/api/v1/participant/${eventId}/session`,
    {},
    {
      headers: {
        'X-Event-Access-Key': activeKey,
      },
    }
  );
  const data = response.data?.data ?? response.data;
  if (data && typeof data === 'object' && 'sessionId' in data) {
    return data as ParticipantSession;
  }
  throw new Error('유효하지 않은 세션 응답 형식입니다.');
};

/**
 * [P-01 보조] 현재 브라우저 쿠키(participant_token) 기반 유효 세션을 조회합니다.
 * @endpoint GET /api/v1/participant/{eventId}/session
 */
export const getParticipantSession = async (eventId: number): Promise<ParticipantSession | null> => {
  if (USE_MOCK) return null;
  try {
    const response = await api.get(`/api/v1/participant/${eventId}/session`);
    const data = response.data?.data ?? response.data;
    return data && typeof data === 'object' && 'sessionId' in data
      ? (data as ParticipantSession)
      : null;
  } catch {
    return null;
  }
};

// ============================================================================
// P-02 & P-05: 공유 앨범 목록, 사진 상세 및 좋아요 API
// ============================================================================

/**
 * [P-02] 주최자 공개 승인된 공유 앨범 미디어 목록을 조회합니다.
 * @endpoint GET /api/v1/participant/{eventId}/media?sort=LATEST|POPULAR&page=0&limit=20
 * @note 주최자 미승인 미디어는 백엔드 정책에 의해 응답 목록에서 제외됩니다.
 */
export const getAlbumPhotos = async (
  eventId: number,
  sort: 'latest' | 'popular' = 'latest',
  page = 0,
  limit = 20
): Promise<AlbumPhoto[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return sortMockPhotos(sort);
  }

  const response = await api.get(`/api/v1/participant/${eventId}/media`, {
    params: {
      sort: sort.toUpperCase(),
      page,
      limit,
    },
  });

  const payload = response.data?.data ?? response.data;
  const rawItems = extractArrayPayload<GalleryItemDto>(payload);
  return rawItems.map((item) => mapGalleryItemToAlbumPhoto(item, sort));
};

/**
 * [P-05] 단일 미디어의 상세 정보 및 원본 Presigned URL을 조회합니다.
 * @endpoint GET /api/v1/participant/{eventId}/media/{mediaId}
 */
export const getGalleryPhotoDetail = async (
  eventId: number,
  mediaId: number | string
): Promise<GalleryDetailDto | null> => {
  if (USE_MOCK) return null;
  const response = await api.get(`/api/v1/participant/${eventId}/media/${mediaId}`);
  return (response.data?.data ?? response.data) as GalleryDetailDto;
};

/**
 * [P-05] 특정 미디어에 좋아요(반응)를 등록합니다. (멱등성 보장 PUT)
 * @endpoint PUT /api/v1/participant/{eventId}/media/{mediaId}/like
 */
export const addPhotoReaction = async (
  eventId: number,
  mediaId: number | string
): Promise<LikeResponseDto> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { mediaId: Number(mediaId), likedByMe: true, likeCount: 1 };
  }
  const response = await api.put(`/api/v1/participant/${eventId}/media/${mediaId}/like`);
  return (response.data?.data ?? response.data) as LikeResponseDto;
};

/**
 * [P-05] 특정 미디어의 좋아요(반응)를 취소합니다.
 * @endpoint DELETE /api/v1/participant/{eventId}/media/{mediaId}/like
 */
export const removePhotoReaction = async (
  eventId: number,
  mediaId: number | string
): Promise<LikeResponseDto> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { mediaId: Number(mediaId), likedByMe: false, likeCount: 0 };
  }
  const response = await api.delete(`/api/v1/participant/${eventId}/media/${mediaId}/like`);
  return (response.data?.data ?? response.data) as LikeResponseDto;
};

// ============================================================================
// P-06: Moment 카드 목록 조회 API
// ============================================================================

/**
 * [P-06] 행사 내 세션/주제별로 분류된 Moment 카드 목록을 조회합니다.
 * @endpoint GET /api/v1/participant/{eventId}/moments
 */
export const getParticipantMoments = async (
  eventId: number
): Promise<ParticipantMomentDto[]> => {
  if (USE_MOCK) return [];
  const response = await api.get(`/api/v1/participant/${eventId}/moments`);
  const payload = response.data?.data ?? response.data;
  return extractArrayPayload<ParticipantMomentDto>(payload);
};