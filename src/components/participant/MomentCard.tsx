/**
 * @file MomentCard.tsx
 * @description 참가자 타임라인 모먼트 View 단일 카드 컴포넌트 (빈 이미지 src 방어 처리 완료)
 */

import React from 'react';
import styled from 'styled-components';
import type { AlbumPhoto } from '../../types/participant';
import { typography } from '../../styles/typography';
import { getPlaceholderGradient } from '../../styles/placeholder';

interface MomentCardProps {
  photo: AlbumPhoto;
  onClick?: () => void;
}

export const MomentCard: React.FC<MomentCardProps> = ({ photo, onClick }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <CardContainer onClick={onClick}>
      <Header>
        <UploaderName>{photo.uploaderName || '익명'}</UploaderName>
        <CaptureTime>{formatDate(photo.capturedAt)}</CaptureTime>
      </Header>

      {/* photo.url이 존재할 때만 img 태그를 렌더링하여 빈 src="" 경고 방지 */}
      <ImageWrapper $bgGradient={getPlaceholderGradient(Number(String(photo.id).replace(/\D/g, '')) || 0)}>
        {photo.url ? (
          <StyledImage src={photo.url} alt={`${photo.uploaderName}의 모먼트`} loading="lazy" />
        ) : null}
      </ImageWrapper>

      <ReactionRow>
        <EmojiBadge>❤️ {photo.reactions?.heart || 0}</EmojiBadge>
        <EmojiBadge>😂 {photo.reactions?.laugh || 0}</EmojiBadge>
        <EmojiBadge>🔥 {photo.reactions?.fire || 0}</EmojiBadge>
        <EmojiBadge>👏 {photo.reactions?.clap || 0}</EmojiBadge>
      </ReactionRow>
    </CardContainer>
  );
};

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 12px;
  gap: 10px;
  cursor: pointer;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UploaderName = styled.span`
  ${typography.section}
  color: ${({ theme }) => theme.colors.text};
`;

const CaptureTime = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
`;

const ImageWrapper = styled.div<{ $bgGradient: string }>`
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  background: ${({ $bgGradient }) => $bgGradient};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ReactionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EmojiBadge = styled.span`
  ${typography.caption}
  padding: 4px 8px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.08);
  color: ${({ theme }) => theme.colors.text};
`;