/**
 * @file MomentViewPage.tsx
 * @description P-06 참가자 Moment 카드 화면 (백엔드 GET .../moments 실데이터 연동 + 미생성 시 시안 폴백)
 * @note
 * - 백엔드에 주최자가 생성한 Moment 데이터가 있으면 실제 세션 제목/시간/썸네일을 렌더링합니다.
 * - 주최자 파트가 아직 Moment를 생성하지 않은 상태에서도 UI 검토가 가능하도록 기본 시안 3개 세션으로 폴백합니다.
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { typography } from '../../styles/typography';
import { Chip, Icon } from '../../components/common';
import {
  getParticipantMoments,
  type ParticipantMomentDto,
} from '../../services/participantApi';

interface MomentSessionItem {
  id: string;
  title: string;
  meta: string;
  countText: string;
  tiles: { gradient: string; url?: string; isVideo?: boolean }[];
}

const DEFAULT_TILE_GRADIENTS = [
  'linear-gradient(145deg, #565b6e 0%, #2a314d 100%)',
  'linear-gradient(145deg, #273df2 0%, #19279c 100%)',
  'linear-gradient(145deg, #6c7082 0%, #3d435c 100%)',
];

// 주최자 Moment 미생성 또는 Mock 환경에서 사용하는 기본 시안 세션 데이터
const FALLBACK_MOMENT_SESSIONS: MomentSessionItem[] = [
  {
    id: 'session_1',
    title: '1부 · 개회식',
    meta: '09:00–10:00 · 대강당',
    countText: '사진·영상 24개',
    tiles: [
      { gradient: 'linear-gradient(145deg, #565b6e 0%, #2a314d 100%)' },
      { gradient: 'linear-gradient(145deg, #273df2 0%, #19279c 100%)' },
      { gradient: 'linear-gradient(145deg, #6c7082 0%, #3d435c 100%)' },
    ],
  },
  {
    id: 'session_2',
    title: '2부 · 팀 활동',
    meta: '10:00–12:00 · 운동장',
    countText: '사진·영상 31개',
    tiles: [
      { gradient: 'linear-gradient(145deg, #2d43c9 0%, #1d2a7a 100%)' },
      { gradient: 'linear-gradient(145deg, #6c7082 0%, #3d435c 100%)' },
      { gradient: 'linear-gradient(145deg, #273df2 0%, #19279c 100%)', isVideo: true },
    ],
  },
  {
    id: 'session_3',
    title: '3부 · 시상식',
    meta: '14:00–15:00 · 대강당',
    countText: '사진·영상 18개',
    tiles: [
      { gradient: 'linear-gradient(145deg, #273df2 0%, #19279c 100%)', isVideo: true },
      { gradient: 'linear-gradient(145deg, #2d43c9 0%, #1d2a7a 100%)' },
      { gradient: 'linear-gradient(145deg, #6c7082 0%, #3d435c 100%)' },
    ],
  },
];

const formatTimeRange = (startsAt?: string | null, endsAt?: string | null, location?: string | null) => {
  const formatHHMM = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  const startStr = formatHHMM(startsAt);
  const endStr = formatHHMM(endsAt);
  const timePart = startStr && endStr ? `${startStr}–${endStr}` : startStr || '';
  return [timePart, location].filter(Boolean).join(' · ') || '행사 세션';
};

const mapDtoToMomentSession = (dto: ParticipantMomentDto): MomentSessionItem => {
  const previews = (dto.mediaList || []).slice(0, 3);
  const tiles = [0, 1, 2].map((idx) => {
    const media = previews[idx];
    return {
      gradient: DEFAULT_TILE_GRADIENTS[idx % DEFAULT_TILE_GRADIENTS.length],
      url: media?.thumbnailUrl || undefined,
      isVideo: media?.mediaType === 'VIDEO',
    };
  });

  const totalCount = dto.mediaCount ?? dto.mediaList?.length ?? 0;

  return {
    id: String(dto.momentId),
    title: dto.title,
    meta: dto.description || formatTimeRange(dto.startsAt, dto.endsAt, dto.location),
    countText: `사진·영상 ${totalCount}개`,
    tiles,
  };
};

export const MomentViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [sessions, setSessions] = useState<MomentSessionItem[]>(FALLBACK_MOMENT_SESSIONS);

  // ==========================================================================
  // 1. 백엔드 Moment 카드 목록 조회 (GET /api/v1/participant/{eventId}/moments)
  // ==========================================================================
  useEffect(() => {
    if (!eventId || isNaN(Number(eventId))) return;

    let isMounted = true;
    const fetchMoments = async () => {
      try {
        const list = await getParticipantMoments(Number(eventId));
        if (!isMounted) return;
        // 서버에 등록된 Moment 카드가 1개 이상일 때만 실데이터로 교체, 비어있으면 시안 폴백 유지
        if (list.length > 0) {
          setSessions(list.map(mapDtoToMomentSession));
        }
      } catch (error) {
        console.warn('[MomentViewPage] Moment API 미응답으로 기본 시안 데이터 유지:', error);
      }
    };

    fetchMoments();
    return () => {
      isMounted = false;
    };
  }, [eventId]);

  return (
    <PageContainer>
      {/* 1. 상단 헤더: < Moment 카드 */}
      <TopHeader>
        <BackButton onClick={() => navigate(-1)} aria-label="뒤로가기">
          <Icon icon="CaretLeft" $size={20} />
        </BackButton>
        <HeaderTitle>Moment 카드</HeaderTitle>
      </TopHeader>

      {/* 2. 상단 필터 칩 행: 세션별 | 카드 N개 */}
      <ChipRow>
        <Chip label="세션별" selected={true} />
        <Chip label={`카드 ${sessions.length}개`} selected={false} />
      </ChipRow>

      {/* 3. 세션별 Moment 카드 리스트 */}
      <CardList>
        {sessions.map((session) => (
          <SessionCard key={session.id}>
            <SessionTitle>{session.title}</SessionTitle>
            <SessionMeta>{session.meta}</SessionMeta>

            <TileGrid3Col>
              {session.tiles.map((tile, idx) => (
                <ThumbTile key={idx} $bgGradient={tile.gradient}>
                  {tile.url && <img src={tile.url} alt={`${session.title} 미리보기 ${idx + 1}`} />}
                  {tile.isVideo && (
                    <VideoBadge>
                      <PlayTriangle />
                    </VideoBadge>
                  )}
                </ThumbTile>
              ))}
            </TileGrid3Col>

            <CountCaption>{session.countText}</CountCaption>
          </SessionCard>
        ))}
      </CardList>

      {/* 4. 하단 읽기 전용 안내 각주 */}
      <FooterNotice>
        읽기 전용 · 주최자가 만든 순간별로 사진을 모아 볼 수 있어요
      </FooterNotice>
    </PageContainer>
  );
};

// ============================================================================
// 스타일 정의
// ============================================================================
const PageContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 20px 16px 32px;
  background-color: ${({ theme }) => theme.colors.bg};
  display: flex;
  flex-direction: column;
`;

const TopHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const HeaderTitle = styled.h1`
  ${typography.appbar}
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ChipRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SessionCard = styled.div`
  padding: 16px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
`;

const SessionTitle = styled.h3`
  ${typography.section}
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 4px 0;
`;

const SessionMeta = styled.p`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
  margin: 0 0 12px 0;
`;

const TileGrid3Col = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
`;

const ThumbTile = styled.div<{ $bgGradient: string }>`
  aspect-ratio: 1;
  border-radius: 10px;
  background: ${({ $bgGradient }) => $bgGradient};
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const VideoBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: rgba(242, 245, 254, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const PlayTriangle = styled.span`
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 7px solid #161826;
  margin-left: 2px;
`;

const CountCaption = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
`;

const FooterNotice = styled.p`
  ${typography.micro}
  color: ${({ theme }) => theme.colors.text3};
  margin-top: 18px;
`;