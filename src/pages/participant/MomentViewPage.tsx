import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAlbumPhotos } from '../../services/participantApi';
import type { AlbumPhoto } from '../../types/participant';
import { MomentCard } from '../../components/participant/MomentCard';

export const MomentViewPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);

  useEffect(() => {
    if (!eventId) return;

    getAlbumPhotos(Number(eventId), 'latest')
      .then((data) => setPhotos(data))
      .catch((err) => console.error('타임라인 로드 실패:', err));
  }, [eventId]);

  return (
    <div style={{ padding: '16px' }}>
      <h2>타임라인 모먼트 View</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {photos.map((photo) => (
          <MomentCard key={photo.id} photo={photo} />
        ))}
      </div>
    </div>
  );
};