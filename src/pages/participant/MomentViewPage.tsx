import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { typography } from '../../styles/typography';
import { AppBar, Icon, IconButton } from '../../components/common';
import { PhotoDetailModal } from '../../components/participant/PhotoDetailModal';
import { getAlbumPhotos } from '../../services/participantApi';
import type { AlbumPhoto } from '../../services/participantApi';

export const MomentViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { shareKey = 'demo-event' } = useParams<{ shareKey: string }>();

  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<AlbumPhoto | null>(null);

  useEffect(() => {
    getAlbumPhotos(shareKey, 'latest').then(setPhotos);
  }, [shareKey]);

  // 촬영 시각(capturedAt) 기준으로 시간대별(정각 범위: 예 18:00 - 19:00) 그룹화 및 정렬
  const momentGroups = useMemo(() => {
    const groups: { [timeKey: string]: { label: string; startTime: number; photos: AlbumPhoto[] } } = {};

    photos.forEach((photo) => {
      const date = new Date(photo.capturedAt);
      const startHourNum = date.getHours();
      const endHourNum = (startHourNum + 1) % 24;

      const startHour = String(startHourNum).padStart(2, '0');
      const endHour = String(endHourNum).padStart(2, '0');
      
      const timeKey = `${startHour}:00 - ${endHour}:00`;

      // 기준 시각 계산을 위해 해당 시간대 정각의 타임스탬프 저장
      const groupBaseTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHourNum).getTime();

      if (!groups[timeKey]) {
        groups[timeKey] = {
          label: timeKey,
          startTime: groupBaseTime,
          photos: [],
        };
      }
      groups[timeKey].photos.push(photo);
    });

    // 💡 이른 시각(과거 시각)의 카드가 화면 상단에 오도록 오름차순(A - B) 정렬
    return Object.values(groups).sort((a, b) => a.startTime - b.startTime);
  }, [photos]);

  return (
    <Container>
      <AppBar
        title="Moment 카드"
        leftAction={
          <IconButton onClick={() => navigate(-1)} aria-label="뒤로가기">
            <Icon icon="CaretLeft" $size={20} />
          </IconButton>
        }
      />

      <Content>
        {momentGroups.length === 0 ? (
          <EmptyState>기록된 Moment 사진이 없습니다.</EmptyState>
        ) : (
          momentGroups.map((group) => (
            <MomentGroupCard key={group.label}>
              <GroupHeader>
                <ClockBadge>
                  <Icon icon="Clock" $size={16} />
                  <span>{group.label}</span>
                </ClockBadge>
                <PhotoCount>{group.photos.length}장의 순간</PhotoCount>
              </GroupHeader>

              <PhotoGrid>
                {group.photos.map((photo) => (
                  <PhotoThumb key={photo.id} onClick={() => setSelectedPhoto(photo)}>
                    <img src={photo.url} alt="Moment 사진" />
                  </PhotoThumb>
                ))}
              </PhotoGrid>
            </MomentGroupCard>
          ))
        )}
      </Content>

      {/* 사진 상세 보기 모달 */}
      {selectedPhoto && (
        <PhotoDetailModal
          photo={selectedPhoto}
          allowDownload={true}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.bg};
  max-width: 480px;
  margin: 0 auto;
`;

const Content = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MomentGroupCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ClockBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.accentText};
  ${typography.section}
`;

const PhotoCount = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const PhotoThumb = styled.div`
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background-color: #000000;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const EmptyState = styled.div`
  padding: 40px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.text3};
  ${typography.body}
`;