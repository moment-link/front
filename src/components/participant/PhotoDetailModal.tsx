import React, { useState } from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';
import { IconButton, Icon, Button } from '../common';
import type { AlbumPhoto } from '../../types/participant';

interface PhotoDetailModalProps {
  photo: AlbumPhoto | null;
  allowDownload?: boolean; // 주최자 다운로드 허용 정책
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

  // 이모지 종류 정의
  const emojiList = [
    { key: 'heart', symbol: '❤️' },
    { key: 'laugh', symbol: '😂' },
    { key: 'fire', symbol: '🔥' },
    { key: 'clap', symbol: '👏' },
  ];

  // 각 이모지별 상태 관리 (로컬 UI 반영용)
  const [reactions, setReactions] = useState<{ [key: string]: number }>({
    heart: photo.reactions?.heart || 0,
    laugh: photo.reactions?.laugh || 0,
    fire: photo.reactions?.fire || 0,
    clap: photo.reactions?.clap || 0,
  });

  const [userSelectedEmoji, setUserSelectedEmoji] = useState<string | null>(null);

  const handleEmojiClick = (emojiKey: string) => {
    setReactions((prev) => {
      const isSelected = userSelectedEmoji === emojiKey;
      const newReactions = { ...prev };

      // 이전 선택 취소
      if (userSelectedEmoji && newReactions[userSelectedEmoji] > 0) {
        newReactions[userSelectedEmoji] -= 1;
      }

      // 새로 선택
      if (!isSelected) {
        newReactions[emojiKey] = (newReactions[emojiKey] || 0) + 1;
        setUserSelectedEmoji(emojiKey);
      } else {
        setUserSelectedEmoji(null);
      }

      return newReactions;
    });

    if (onReactionToggle) {
      onReactionToggle(photo.id, emojiKey);
    }
  };

  const handleDownload = () => {
    if (!allowDownload) {
      alert('주최자가 사진 다운로드를 제한한 행사입니다.');
      return;
    }
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `moment_${String(photo.id)}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}.${day} ${hours}:${minutes}`;
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 상단 헤더: 뒤로가기(<) 버튼 + 업로더 정보 */}
        <Header>
          <IconButton onClick={onClose} aria-label="뒤로가기">
            <Icon icon="CaretLeft" $size={20} />
          </IconButton>
          <UploaderInfo>
            <Nickname>{photo.uploaderName || '익명'}</Nickname>
            <CaptureTime>{formatDate(photo.capturedAt)}</CaptureTime>
          </UploaderInfo>
        </Header>

        {/* 이미지 보기 */}
        <ImageWrapper>
          <StyledImage src={photo.url} alt="상세 사진" />
        </ImageWrapper>

        {/* 이모지 반응 버튼 영역 */}
        <ReactionSection>
          {emojiList.map((item) => {
            const count = reactions[item.key] || 0;
            const isActive = userSelectedEmoji === item.key;
            return (
              <EmojiButton
                key={item.key}
                $isActive={isActive}
                onClick={() => handleEmojiClick(item.key)}
              >
                <EmojiSymbol>{item.symbol}</EmojiSymbol>
                <Count>{count}</Count>
              </EmojiButton>
            );
          })}
        </ReactionSection>

        {/* 안내 문구 */}
        <NoticeText>사진 1장에 반응 1개 · 다시 누르면 취소</NoticeText>

        {/* 사진 저장 하단 CTA */}
        <Footer>
          <Button
            $variant="primary"
            $size="large"
            disabled={!allowDownload}
            onClick={handleDownload}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Icon icon="DownloadSimple" $size={18} />
            {allowDownload ? '사진 저장' : '다운로드 제한됨'}
          </Button>
        </Footer>
      </ModalContainer>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

const ModalContainer = styled.div`
  width: 100%;
  max-width: 440px;
  height: 100%;
  max-height: 90vh;
  background-color: ${({ theme }) => theme.colors.bg};
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
`;

const UploaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Nickname = styled.span`
  ${typography.title}
  color: ${({ theme }) => theme.colors.text};
`;

const CaptureTime = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
`;

const ImageWrapper = styled.div`
  flex: 1;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background-color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const ReactionSection = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
`;

const EmojiButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  border-radius: 24px;
  border: 1px solid ${({ $isActive, theme }) => ($isActive ? theme.colors.primary : theme.colors.border)};
  background-color: ${({ $isActive }) => ($isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)')};
  cursor: pointer;
  transition: all 0.2s ease;
`;

const EmojiSymbol = styled.span`
  ${typography.appbar}
`;

const Count = styled.span`
  ${typography.label}
  color: ${({ theme }) => theme.colors.text};
`;

const NoticeText = styled.p`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text3};
  text-align: left;
  margin-bottom: 16px;
`;

const Footer = styled.div`
  width: 100%;
`;