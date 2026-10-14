/**
 * @file PhotoCard.tsx
 * @description 참가자 공유 앨범 갤러리 뷰 단일 사진 카드 컴포넌트 (Typography 토큰 적용)
 */

import React from 'react';
import styled from 'styled-components';
import type { AlbumPhoto } from '../../types/participant';
import { typography } from '../../styles/typography';

interface PhotoCardProps {
  photo: AlbumPhoto;
  onClick?: () => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick }) => {
  // 총 이모지 반응 수 계산
  const totalReactions = photo.reactions
    ? Object.values(photo.reactions).reduce((acc, cur) => acc + cur, 0)
    : 0;

  return (
    <CardContainer onClick={onClick}>
      <ImageWrapper>
        <StyledImage src={photo.url} alt={`${photo.uploaderName}의 사진`} loading="lazy" />
        {photo.isPopular && <PopularBadge>Popular</PopularBadge>}
      </ImageWrapper>
      <CardInfo>
        <UploaderName>{photo.uploaderName || '익명'}</UploaderName>
        {totalReactions > 0 && <ReactionCount>❤️ {totalReactions}</ReactionCount>}
      </CardInfo>
    </CardContainer>
  );
};

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface || 'rgba(255, 255, 255, 0.05)'};
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: #000000;
  overflow: hidden;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PopularBadge = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: ${({ theme }) => theme.colors.primary || '#6366f1'};
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
  ${typography.caption}
`;

const CardInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
`;

const UploaderName = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ReactionCount = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
`;