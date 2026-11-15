/**
 * @file PhotoDetailModal.tsx
 * @description 사진 상세 전체 화면 뷰어 (공통 컴포넌트 AppBar, IconButton, Avatar, Button 적용)
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';
import { AppBar, Avatar, Button, Icon, IconButton } from '../common';
import type { AlbumPhoto } from '../../types/participant';
import { getPlaceholderGradient } from '../../styles/placeholder';

interface PhotoDetailModalProps {
  photo: AlbumPhoto | null;
  allowDownload?: boolean;
  onClose: () => void;
  onReactionToggle?: (photoId: string | number, emoji: string) => void;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  photo,
  allowDownload = true,
  onClose,
  onReactionToggle,
}) => {
  if (!photo) return null;

  const emojiList = [
    { key: 'heart', symbol: '❤️' },
    { key: 'laugh', symbol: '😂' },
    { key: 'fire', symbol: '🔥' },
    { key: 'clap', symbol: '👏' },
  ];

  const [reactions, setReactions] = useState<{ [key: string]: number }>({
    heart: photo.reactions?.heart || 0,
    laugh: photo.reactions?.laugh || 0,
    fire: photo.reactions?.fire || 0,
    clap: photo.reactions?.clap || 0,
  });

  const [userSelectedEmoji, setUserSelectedEmoji] = useState<string | null>('heart');

  const handleEmojiClick = (emojiKey: string) => {
    setReactions((prev) => {
      const isSelected = userSelectedEmoji === emojiKey;
      const next = { ...prev };

      if (userSelectedEmoji && next[userSelectedEmoji] > 0) {
        next[userSelectedEmoji] -= 1;
      }

      if (!isSelected) {
        next[emojiKey] = (next[emojiKey] || 0) + 1;
        setUserSelectedEmoji(emojiKey);
      } else {
        setUserSelectedEmoji(null);
      }

      return next;
    });

    if (onReactionToggle) {
      onReactionToggle(photo.id, emojiKey);
    }
  };

  const handleDownload = () => {
    if (!allowDownload) return;
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `moment_${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatMetaDate = (dateString: string) => {
    const d = new Date(dateString);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${mm}.${dd} ${hh}:${min} · 1부 · 개회식`;
  };

  return (
    <FullScreenOverlay>
      <ScreenContainer>
        {/* 1. 공통 AppBar 및 IconButton 컴포넌트 적용 */}
        <AppBar
          title="사진"
          leftAction={
            <IconButton onClick={onClose} aria-label="뒤로가기">
              <Icon icon="CaretLeft" $size={20} />
            </IconButton>
          }
        />

        <BodyContent>
          {/* 2. 정사각형 고화질 사진 뷰어 */}
          <PhotoFrame $bgGradient={getPlaceholderGradient(0)}>
            {photo.url && <img src={photo.url} alt="상세 사진" />}
          </PhotoFrame>

          {/* 3. 공통 Avatar 컴포넌트 + 업로더 닉네임 + 일시/세션명 */}
          <UploaderRow>
            <Avatar name={photo.uploaderName || '민'} />
            <UploaderMeta>
              <UploaderName>{photo.uploaderName || '민지'}</UploaderName>
              <SubInfo>{formatMetaDate(photo.capturedAt)}</SubInfo>
            </UploaderMeta>
          </UploaderRow>

          {/* 4. 4열 세로형 반응 이모지 카드 그리드 */}
          <ReactionGrid4Col>
            {emojiList.map((item) => {
              const count = reactions[item.key] || 0;
              const isActive = userSelectedEmoji === item.key;
              return (
                <ReactionCard
                  key={item.key}
                  type="button"
                  $active={isActive}
                  onClick={() => handleEmojiClick(item.key)}
                >
                  <EmojiIcon>{item.symbol}</EmojiIcon>
                  <ReactionCount>{count}</ReactionCount>
                </ReactionCard>
              );
            })}
          </ReactionGrid4Col>

          <ReactionNotice>사진 1장당 반응은 1개만 등록·취소할 수 있어요</ReactionNotice>

          {/* 5. 하단 사진 저장 버튼(공통 Button) 및 정책 안내 */}
          <BottomArea>
            {allowDownload && (
              <Button
                $variant="primary"
                $size="large"
                onClick={handleDownload}
                style={{ width: '100%' }}
              >
                <Icon icon="DownloadSimple" $size={18} />
                <span>사진 저장</span>
              </Button>
            )}
            <DownloadPolicyText>
              주최자가 다운로드를 허용한 행사에서만 보여요
            </DownloadPolicyText>
          </BottomArea>
        </BodyContent>
      </ScreenContainer>
    </FullScreenOverlay>
  );
};

// ============================================================================
// 스타일 정의
// ============================================================================
const FullScreenOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.bg};
  z-index: 1000;
  overflow-y: auto;
`;

const ScreenContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const BodyContent = styled.div`
  padding: 16px 16px 32px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const PhotoFrame = styled.div<{ $bgGradient: string }>`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  background: ${({ $bgGradient }) => $bgGradient};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 16px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UploaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const UploaderMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UploaderName = styled.span`
  ${typography.section}
  color: ${({ theme }) => theme.colors.text};
`;

const SubInfo = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
`;

const ReactionGrid4Col = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 10px;
`;

const ReactionCard = styled.button<{ $active: boolean }>`
  padding: 12px 0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.sunken : theme.colors.surface};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.accentLine : theme.colors.border};
`;

const EmojiIcon = styled.span`
  font-size: 20px;
`;

const ReactionCount = styled.span`
  ${typography.label}
  color: ${({ theme }) => theme.colors.text};
`;

const ReactionNotice = styled.p`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text3};
  margin: 0 0 24px 0;
`;

const BottomArea = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const DownloadPolicyText = styled.p`
  ${typography.micro}
  color: ${({ theme }) => theme.colors.text3};
  margin: 0;
`;