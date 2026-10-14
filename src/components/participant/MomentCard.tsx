/**
 * @file MomentCard.tsx
 * @description 참가자 타임라인 모먼트 View 단일 카드 컴포넌트 (Typography 토큰 적용)
 */

import React from 'react';
import styled from 'styled-components';
import type { AlbumPhoto } from '../../types/participant';
import { typography } from '../../styles/typography';

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
      <ImageWrapper>
        <StyledImage src={photo.url} alt={`${photo.uploaderName}의 모먼트`} loading="lazy" />
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
  background-color: ${({ theme }) => theme.colors.surface || 'rgba(255, 255, 255, 0.05)'};
  border-radius: 16px;
  padding: 12px;
  gap: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UploaderName = styled.span`
  ${typography.title}
  color: ${({ theme }) => theme.colors.text};
`;

const CaptureTime = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
`;

const ImageWrapper = styled.div`
  width: 100%;
  max-height: 320px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  max-height: 320px;
  object-fit: contain;
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