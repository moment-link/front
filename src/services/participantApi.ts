export interface ParticipantSession {
  participantSessionId: string;
  shareKey: string;
  nickname: string;
}

export interface AlbumPhoto {
  id: string;
  url: string;
  uploaderName: string;
  capturedAt: string;
  reactions: {
    heart: number;
    laugh: number;
    fire: number;
    clap: number;
  };
  isApproved: boolean;
  isPopular?: boolean;
}

// 1. 참가자 세션 발급 Mock API
export const postJoinSession = async (
  shareKey: string,
  inputNickname?: string
): Promise<ParticipantSession> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const nickname = inputNickname?.trim() || `참가자_${Math.floor(1000 + Math.random() * 9000)}`;
  const participantSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  return {
    participantSessionId,
    shareKey,
    nickname,
  };
};

// 2. 공유 앨범 사진 목록 조회 Mock API
export const getAlbumPhotos = async (
  shareKey: string,
  sort: 'latest' | 'popular' = 'latest'
): Promise<AlbumPhoto[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // shareKey 읽기 처리 (경고 해결)
  console.log(`[Mock API] Fetching album photos for event: ${shareKey}`);

  const mockPhotos: AlbumPhoto[] = [
    {
      id: 'photo_1',
      url: 'https://picsum.photos/400/400?random=1',
      uploaderName: '즐거운포토',
      capturedAt: new Date(Date.now() - 3600000).toISOString(),
      reactions: { heart: 12, laugh: 3, fire: 8, clap: 5 },
      isApproved: true,
      isPopular: true,
    },
    {
      id: 'photo_2',
      url: 'https://picsum.photos/400/400?random=2',
      uploaderName: '익명',
      capturedAt: new Date(Date.now() - 7200000).toISOString(),
      reactions: { heart: 4, laugh: 1, fire: 2, clap: 0 },
      isApproved: true,
      isPopular: false,
    },
  ];

  if (sort === 'popular') {
    return [...mockPhotos].sort((a, b) => {
      const sumA = Object.values(a.reactions).reduce((acc, cur) => acc + cur, 0);
      const sumB = Object.values(b.reactions).reduce((acc, cur) => acc + cur, 0);
      return sumB - sumA;
    });
  }

  return mockPhotos;
};