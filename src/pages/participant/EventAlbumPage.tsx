import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { typography } from '../../styles/typography';
import { Button } from '../../components/common/Button';
import { SegmentedTab } from '../../components/common/SegmentedTab';
import { PhotoDetailModal } from '../../components/participant/PhotoDetailModal';
import { getAlbumPhotos } from '../../services/participantApi';
import type { AlbumPhoto } from '../../services/participantApi';

export const EventAlbumPage: React.FC = () => {
  const navigate = useNavigate();
  const { shareKey = 'demo-event' } = useParams<{ shareKey: string }>();

  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [selectedPhoto, setSelectedPhoto] = useState<AlbumPhoto | null>(null);

  useEffect(() => {
    getAlbumPhotos(shareKey, sort).then(setPhotos);
  }, [shareKey, sort]);

  return (
    <Container>
      <Header>
        <TitleGroup>
          <PageTitle>공유 앨범</PageTitle>
          <Button
            $variant="secondary"
            $size="medium"
            onClick={() => navigate(`/event/${shareKey}/moments`)}
          >
            Moment 카드 ›
          </Button>
        </TitleGroup>

        <ButtonGroup>
          <Button onClick={() => navigate('/upload')}>+ 업로드</Button>
          <Button onClick={() => navigate('/upload?mode=camera')}>📷 촬영</Button>
        </ButtonGroup>
      </Header>

      {/* SegmentedTab 규격 적용 */}
      <SegmentedTab
        options={[
          { key: 'latest', label: '최신순' },
          { key: 'popular', label: '인기순' },
        ]}
        activeKey={sort}
        onChange={(key) => setSort(key as 'latest' | 'popular')}
      />

      <PhotoGrid style={{ marginTop: '16px' }}>
        {photos.map((photo) => (
          <PhotoCard key={photo.id} onClick={() => setSelectedPhoto(photo)}>
            <img src={photo.url} alt="행사 사진" />
            <Uploader>{photo.uploaderName}</Uploader>
          </PhotoCard>
        ))}
      </PhotoGrid>

      {/* 사진 클릭 시 상세 보기 모달 노출 */}
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
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.bg};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PageTitle = styled.h2`
  ${typography.appbar}
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const PhotoCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
`;

const Uploader = styled.div`
  padding: 8px 12px;
  ${typography.micro}
  color: ${({ theme }) => theme.colors.text2};
`;