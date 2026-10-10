import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../../components/common/Button';
import { SegmentedTab } from '../../components/common/SegmentedTab';
import { getAlbumPhotos } from '../../services/participantApi';
import type { AlbumPhoto } from '../../services/participantApi';

export const EventAlbumPage: React.FC = () => {
  const navigate = useNavigate();
  const { shareKey = 'demo-event' } = useParams<{ shareKey: string }>();
  
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');

  useEffect(() => {
    getAlbumPhotos(shareKey, sort).then(setPhotos);
  }, [shareKey, sort]);

  return (
    <Container>
      <Header>
        <h2>공유 앨범</h2>
        <ButtonGroup>
          <Button onClick={() => navigate('/upload')}>+ 업로드</Button>
          <Button onClick={() => navigate('/upload?mode=camera')}>📷 촬영</Button>
        </ButtonGroup>
      </Header>

      {/* SegmentedTab 규격 적용: key 속성 및 activeKey 사용 */}
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
          <PhotoCard key={photo.id}>
            <img src={photo.url} alt="행사 사진" />
            <Uploader>{photo.uploaderName}</Uploader>
          </PhotoCard>
        ))}
      </PhotoGrid>
    </Container>
  );
};

const Container = styled.div`
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
`;

const Uploader = styled.div`
  padding: 8px;
  font-size: 12px;
  color: #333;
`;