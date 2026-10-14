/**
 * @file participantApi.ts
 * @description MomentLink 참가자 파트 백엔드 API 연동 서비스
 */

import { api } from './api';
import type { PublicEventInfo, ParticipantSession, AlbumPhoto } from '../types/participant';

export type { PublicEventInfo, ParticipantSession, AlbumPhoto };

/**
 * [P-01] 공유 키(accessKey)를 이용해 공개 행사의 기본 정보를 조회합니다.
 */
export const getPublicEventInfo = async (shareKey: string): Promise<PublicEventInfo> => {
  if (!shareKey) {
    throw new Error('유효한 공유 키가 요구됩니다.');
  }

  const cleanKey = shareKey.trim();
  const response = await api.get('/api/v1/events/access', {
    headers: {
      'X-Event-Access-Key': cleanKey,
    },
  });
  return response.data.data;
};

/**
 * [P-02] 참가자 세션을 발급받고 브라우저 쿠키(participant_token)를 생성합니다.
 */
export const postJoinSession = async (
  eventId: number,
  shareKey: string
): Promise<ParticipantSession> => {
  const cleanKey = shareKey.trim();
  const response = await api.post(
    `/api/v1/participant/${eventId}/session`,
    {},
    {
      headers: {
        'X-Event-Access-Key': cleanKey,
      },
    }
  );
  return response.data;
};

/**
 * [P-03] 공유 앨범 피드의 사진 목록을 조회합니다. (participant_token 쿠키 자동 전송)
 */
export const getAlbumPhotos = async (
  eventId: number,
  sort: 'latest' | 'popular' = 'latest'
): Promise<AlbumPhoto[]> => {
  const response = await api.get(`/api/v1/participant/${eventId}/media`, {
    params: { sort: sort.toUpperCase() },
  });
  return response.data.data;
};

/**
 * [P-04] 특정 사진에 이모지 반응(좋아요)을 등록합니다.
 */
export const addPhotoReaction = async (eventId: number, mediaId: number | string) => {
  const response = await api.put(`/api/v1/participant/${eventId}/media/${mediaId}/like`);
  return response.data;
};

/**
 * [P-05] 특정 사진의 이모지 반응(좋아요)을 취소합니다.
 */
export const removePhotoReaction = async (eventId: number, mediaId: number | string) => {
  const response = await api.delete(`/api/v1/participant/${eventId}/media/${mediaId}/like`);
  return response.data;
};