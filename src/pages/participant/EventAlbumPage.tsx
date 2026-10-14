/**
 * @file EventAlbumPage.tsx
 * @description 참가자 공유 앨범 갤러리 피드 페이지 (예외 및 무한 로딩 방지)
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  getAlbumPhotos,
  addPhotoReaction,
} from '../../services/participantApi';
import type { AlbumPhoto } from '../../types/participant';
import { PhotoCard } from '../../components/participant/PhotoCard';
import { PhotoDetailModal } from '../../components/participant/PhotoDetailModal';
import { typography } from '../../styles/typography';

export const EventAlbumPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<AlbumPhoto | null>(null);

  // 1. 앨범 사진 목록 로드
  useEffect(() => {
    console.log('[EventAlbumPage 진입] eventId:', eventId);

    if (!eventId || isNaN(Number(eventId))) {
      console.error('유효하지 않은 eventId입니다:', eventId);
      setErrorMsg('유효하지 않은 행사 ID입니다.');
      setLoading(false);
      return;
    }

    const fetchPhotos = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const data = await getAlbumPhotos(Number(eventId), 'latest');
        console.log('[앨범 사진 목록 수신 성공]:', data);
        setPhotos(data || []);
      } catch (err: any) {
        console.error('[앨범 사진 로드 실패]:', err);
        setErrorMsg(
          err.response?.data?.message || '사진 목록을 불러오는 중 오류가 발생했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [eventId]);

  // 2. 이모지 반응 토글 핸들러
  const handleReactionToggle = async (photoId: string | number, emojiKey: string) => {
    if (!eventId) return;

    try {
      const targetPhoto = photos.find((p) => String(p.id) === String(photoId));
      if (!targetPhoto) return;

      await addPhotoReaction(Number(eventId), photoId);

      setPhotos((prevPhotos) =>
        prevPhotos.map((p) => {
          if (String(p.id) === String(photoId)) {
            const currentCount = p.reactions?.[emojiKey as keyof typeof p.reactions] || 0;
            return {
              ...p,
              reactions: {
                ...p.reactions,
                [emojiKey]: currentCount + 1,
              },
            };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('이모지 반응 처리 실패:', error);
    }
  };

  return (
    <PageContainer>
      <PageTitle>공유 앨범 갤러리</PageTitle>

      {/* 로딩 및 상태 표시 */}
      {loading ? (
        <MessageState>사진을 불러오는 중입니다...</MessageState>
      ) : errorMsg ? (
        <MessageState style={{ color: '#ef4444' }}>{errorMsg}</MessageState>
      ) : photos.length === 0 ? (
        <MessageState>
          아직 등록된 사진이 없습니다.
          <br />첫 번째 순간을 기록해 보세요!
        </MessageState>
      ) : (
        <PhotoGrid>
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => setSelectedPhoto(photo)}
            />
          ))}
        </PhotoGrid>
      )}

      {/* 사진 상세 보기 모달 */}
      {selectedPhoto && (
        <PhotoDetailModal
          photo={selectedPhoto}
          allowDownload={true}
          onClose={() => setSelectedPhoto(null)}
          onReactionToggle={handleReactionToggle}
        />
      )}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
`;

const PageTitle = styled.h2`
  ${typography.page}
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
`;

const MessageState = styled.div`
  ${typography.body}
  color: ${({ theme }) => theme.colors.text2};
  text-align: center;
  padding: 40px 0;
  line-height: 1.5;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;