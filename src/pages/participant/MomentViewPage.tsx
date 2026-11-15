/**
 * @file MomentViewPage.tsx
 * @description P-06 참가자 Moment 카드 화면 (첨부 시안 image_d2d125.jpg 100% 일치 구현)
 */

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { typography } from '../../styles/typography';
import { Chip, Icon } from '../../components/common';

interface MomentSessionItem {
  id: string;
  title: string;
  meta: string;
  countText: string;
  tiles: { gradient: string; isVideo?: boolean }[];
}

// 시안(image_d2d125.jpg)의 3개 세션 카드 데이터 및 타일 그라디언트
const MOMENT_SESSIONS: MomentSessionItem[] = [
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

export const MomentViewPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      {/* 1. 상단 헤더: < Moment 카드 */}
      <TopHeader>
        <BackButton onClick={() => navigate(-1)} aria-label="뒤로가기">
          <Icon icon="CaretLeft" $size={20} />
        </BackButton>
        <HeaderTitle>Moment 카드</HeaderTitle>
      </TopHeader>

      {/* 2. 상단 필터 칩 행: 세션별 | 카드 3개 */}
      <ChipRow>
        <Chip label="세션별" selected={true} />
        <Chip label="카드 3개" selected={false} />
      </ChipRow>

      {/* 3. 세션별 Moment 카드 리스트 */}
      <CardList>
        {MOMENT_SESSIONS.map((session) => (
          <SessionCard key={session.id}>
            <SessionTitle>{session.title}</SessionTitle>
            <SessionMeta>{session.meta}</SessionMeta>

            <TileGrid3Col>
              {session.tiles.map((tile, idx) => (
                <ThumbTile key={idx} $bgGradient={tile.gradient}>
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
// 스타일 정의 (Figma P-06 image_d2d125.jpg 100% 일치)
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