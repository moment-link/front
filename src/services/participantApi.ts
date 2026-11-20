/**
 * @file participantApi.ts
 * @description MomentLink 참가자 파트 백엔드 실서버 연동 서비스
 */

import { api } from './api';
import type { PublicEventInfo, ParticipantSession, AlbumPhoto } from '../types/participant';

export type { PublicEventInfo, ParticipantSession, AlbumPhoto };

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

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

const mapGalleryItemToAlbumPhoto = (
  item: GalleryItemDto,
  sort: 'latest' | 'popular'
): AlbumPhoto => {
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
  };
};

const extractGalleryItems = (payload: unknown): GalleryItemDto[] => {
  if (Array.isArray(payload)) return payload as GalleryItemDto[];
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content as GalleryItemDto[];
    if (Array.isArray(obj.items)) return obj.items as GalleryItemDto[];
  }
  return [];
};

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
          return retryData as PublicEventInfo;
        }
      }
    }
    throw error;
  }
};

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
  const rawItems = extractGalleryItems(payload);
  return rawItems.map((item) => mapGalleryItemToAlbumPhoto(item, sort));
};

export const getGalleryPhotoDetail = async (
  eventId: number,
  mediaId: number | string
): Promise<GalleryDetailDto> => {
  const response = await api.get(`/api/v1/participant/${eventId}/media/${mediaId}`);
  return (response.data?.data ?? response.data) as GalleryDetailDto;
};

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