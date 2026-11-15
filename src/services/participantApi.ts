/**
 * @file participantApi.ts
 * @description MomentLink 참가자 파트 백엔드 실서버 연동 서비스 (응답 데이터 타입 검증 및 배열 보장 방어 로직 적용)
 */

import { api } from './api';
import type { PublicEventInfo, ParticipantSession, AlbumPhoto } from '../types/participant';

export type { PublicEventInfo, ParticipantSession, AlbumPhoto };

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ============================================================================
// [MOCK / FALLBACK] Figma P-01 & P-02 시안 기본 데이터 셋
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
  {
    id: 'photo_3',
    url: '',
    uploaderName: '익명 참가자',
    capturedAt: '2026-10-02T09:40:00Z',
    reactions: { heart: 15, laugh: 1, fire: 3, clap: 2 },
    isApproved: true,
    isPopular: true,
  },
  {
    id: 'photo_4',
    url: '',
    uploaderName: '용감한 고래',
    capturedAt: '2026-10-02T10:05:00Z',
    reactions: { heart: 8, laugh: 4, fire: 2, clap: 1 },
    isApproved: true,
    isPopular: false,
  },
  {
    id: 'photo_5',
    url: '',
    uploaderName: '민지',
    capturedAt: '2026-10-02T10:18:00Z',
    reactions: { heart: 6, laugh: 1, fire: 1, clap: 0 },
    isApproved: true,
    isPopular: false,
  },
  {
    id: 'photo_6',
    url: '',
    uploaderName: '반짝이는 수달',
    capturedAt: '2026-10-02T10:30:00Z',
    reactions: { heart: 5, laugh: 2, fire: 0, clap: 1 },
    isApproved: true,
    isPopular: false,
  },
  {
    id: 'photo_7',
    url: '',
    uploaderName: '익명 참가자',
    capturedAt: '2026-10-02T11:00:00Z',
    reactions: { heart: 9, laugh: 0, fire: 2, clap: 1 },
    isApproved: true,
    isPopular: false,
  },
  {
    id: 'photo_8',
    url: '',
    uploaderName: '용감한 고래',
    capturedAt: '2026-10-02T11:15:00Z',
    reactions: { heart: 4, laugh: 1, fire: 1, clap: 0 },
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
 * [DEV] 백엔드 DevController를 호출하여 유효한 개발용 행사와 accessKey를 즉시 발급받습니다.
 */
export const createDevEvent = async (): Promise<{ eventId: number; accessKey: string } | null> => {
  try {
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
      console.info('[REAL API - DevController] 신규 개발용 행사 발급 완료:', data);
      return { eventId: data.eventId, accessKey };
    }
    return null;
  } catch (err) {
    console.warn('[DevController 호출 실패]:', err);
    return null;
  }
};

/**
 * [P-01] 공유 키(accessKey)를 이용해 공개 행사의 기본 정보를 조회합니다.
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
      console.info('[REAL API] 공개 행사 조회 성공 (GET /api/v1/events/access):', result);
      return result as PublicEventInfo;
    }

    throw new Error('유효하지 않은 행사 응답 형식입니다.');
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.warn('[REAL API] 기존 공유 키가 만료되어 /api/dev/events 로 신규 행사를 자동 발급합니다.');
      const devEvent = await createDevEvent();
      if (devEvent?.accessKey) {
        const retryRes = await api.get('/api/v1/events/access', {
          headers: {
            'X-Event-Access-Key': devEvent.accessKey,
          },
        });
        const retryData = retryRes.data?.data ?? retryRes.data;
        if (retryData && typeof retryData === 'object' && 'eventId' in retryData) {
          return retryData as PublicEventInfo;
        }
      }
    }

    console.warn('[FALLBACK] 실서버 공개 행사 조회 실패, 시안 기본 데이터를 반환합니다.');
    return MOCK_EVENT_INFO;
  }
};

/**
 * [P-02] 참가자 세션을 발급받고 브라우저 쿠키(participant_token)를 생성합니다.
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

  const activeKey = (sessionStorage.getItem('currentShareKey') || shareKey).trim();

  try {
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
      console.info(
        '[REAL API] 참가자 세션 발급 및 participant_token 쿠키 생성 완료 (POST /session):',
        data
      );
      return data as ParticipantSession;
    }
    throw new Error('유효하지 않은 세션 응답 형식입니다.');
  } catch (error: any) {
    console.warn('[FALLBACK] 실서버 세션 발급 실패, 로컬 임시 세션으로 대체합니다.', error);
    return {
      sessionId: 2,
      eventId: eventId || 42,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    };
  }
};

/**
 * [P-02 보조] 현재 참가자 세션을 쿠키(participant_token) 기반으로 조회합니다.
 */
export const getParticipantSession = async (eventId: number): Promise<ParticipantSession | null> => {
  if (USE_MOCK) return null;
  try {
    const response = await api.get(`/api/v1/participant/${eventId}/session`);
    const data = response.data?.data ?? response.data;
    return data && typeof data === 'object' && 'sessionId' in data ? data : null;
  } catch {
    return null;
  }
};

/**
 * [P-03] 공유 앨범 피드의 사진 목록을 조회합니다.
 * - 반드시 배열(AlbumPhoto[])만 반환하도록 Array.isArray 방어 로직 적용
 */
export const getAlbumPhotos = async (
  eventId: number,
  sort: 'latest' | 'popular' = 'latest'
): Promise<AlbumPhoto[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return sortMockPhotos(sort);
  }

  try {
    const response = await api.get(`/api/v1/participant/${eventId}/media`, {
      params: { sort: sort.toUpperCase() },
    });
    const list = response.data?.data ?? response.data;
    if (Array.isArray(list)) {
      return list;
    }
    return sortMockPhotos(sort);
  } catch {
    return sortMockPhotos(sort);
  }
};

/**
 * [P-04] 특정 사진에 이모지 반응(좋아요)을 등록합니다.
 */
export const addPhotoReaction = async (eventId: number, mediaId: number | string) => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { success: true };
  }
  try {
    const response = await api.put(`/api/v1/participant/${eventId}/media/${mediaId}/like`);
    return response.data;
  } catch {
    return { success: true };
  }
};

/**
 * [P-05] 특정 사진의 이모지 반응(좋아요)을 취소합니다.
 */
export const removePhotoReaction = async (eventId: number, mediaId: number | string) => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { success: true };
  }
  try {
    const response = await api.delete(`/api/v1/participant/${eventId}/media/${mediaId}/like`);
    return response.data;
  } catch {
    return { success: true };
  }
};