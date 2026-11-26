/**
 * @file PhotoDetailModal.tsx
 * @description P-05 사진 상세 전체 화면 뷰어 (상세 조회 GET 및 좋아요 등록 PUT / 취소 DELETE 실서버 연동)
 * @note
 * - 백엔드 1학기 스펙상 좋아요는 단일 카운트(likeCount, likedByMe)로 관리되므로 대표 반응('heart')에 실서버 API를 바인딩합니다.
 * - 나머지 3종 이모지('laugh', 'fire', 'clap')는 UI 상호작용을 유지하되 실서버 좋아요 카운트와 충돌하지 않도록 분리 처리합니다.
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';
import { AppBar, Avatar, Button, Icon, IconButton } from '../common';
import type { AlbumPhoto } from '../../types/participant';
import {
  getGalleryPhotoDetail,
  addPhotoReaction,
  removePhotoReaction,
} from '../../services/participantApi';
import { getPlaceholderGradient } from '../../styles/placeholder';

interface PhotoDetailModalProps {
  eventId?: number;
  photo: (AlbumPhoto & { likedByMe?: boolean }) | null;
  allowDownload?: boolean;
  onClose: () => void;
  onReactionToggle?: (
    photoId: string | number,
    emoji: string,
    serverState?: { likeCount: number; likedByMe: boolean }
  ) => void;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  eventId,
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

  const [displayUrl, setDisplayUrl] = useState<string>(photo.url || '');
  const [uploaderName, setUploaderName] = useState<string>(photo.uploaderName || '익명 참가자');
  const [capturedAt, setCapturedAt] = useState<string>(photo.capturedAt);

  const [reactions, setReactions] = useState<{ [key: string]: number }>({
    heart: photo.reactions?.heart || 0,
    laugh: photo.reactions?.laugh || 0,
    fire: photo.reactions?.fire || 0,
    clap: photo.reactions?.clap || 0,
  });

  // 서버에서 내려준 likedByMe 값이 true인 경우에만 초기 활성 상태로 지정
  const [userSelectedEmoji, setUserSelectedEmoji] = useState<string | null>(
    photo.likedByMe ? 'heart' : null
  );
  const [isSubmittingLike, setIsSubmittingLike] = useState(false);

  // ==========================================================================
  // 1. 모달 진입 시 백엔드 단건 상세 조회(GET .../media/{mediaId}) 호출
  // ==========================================================================
  useEffect(() => {
    setDisplayUrl(photo.url || '');
    setUploaderName(photo.uploaderName || '익명 참가자');
    setCapturedAt(photo.capturedAt);
    setReactions({
      heart: photo.reactions?.heart || 0,
      laugh: photo.reactions?.laugh || 0,
      fire: photo.reactions?.fire || 0,
      clap: photo.reactions?.clap || 0,
    });
    setUserSelectedEmoji(photo.likedByMe ? 'heart' : null);

    if (!eventId || !photo.id) return;

    let isMounted = true;
    const fetchDetail = async () => {
      try {
        const detail = await getGalleryPhotoDetail(eventId, photo.id);
        if (!isMounted || !detail) return;

        // 상세 API에서 원본 고화질 mediaUrl이 내려오면 우선 적용
        if (detail.mediaUrl || detail.thumbnailUrl) {
          setDisplayUrl(detail.mediaUrl || detail.thumbnailUrl || '');
        }
        if (detail.uploaderDisplayName) {
          setUploaderName(detail.uploaderDisplayName);
        }
        if (detail.capturedAt || detail.uploadedAt) {
          setCapturedAt(detail.capturedAt || detail.uploadedAt || photo.capturedAt);
        }
        setReactions((prev) => ({
          ...prev,
          heart: Number(detail.likeCount ?? prev.heart),
        }));
        setUserSelectedEmoji(detail.likedByMe ? 'heart' : null);
      } catch (error) {
        // 상세 API 실패 시 목록에서 전달받은 기본 썸네일/메타 정보 유지
        console.warn('[PhotoDetailModal] 상세 조회 폴백 처리:', error);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [eventId, photo]);

  // ==========================================================================
  // 2. 반응(좋아요) 등록(PUT) 및 취소(DELETE) 핸들러
  // ==========================================================================
  const handleEmojiClick = async (emojiKey: string) => {
    if (isSubmittingLike) return;

    const isAlreadySelected = userSelectedEmoji === emojiKey;
    const nextSelected = isAlreadySelected ? null : emojiKey;

    // 낙관적 UI(Optimistic UI) 선반영
    setReactions((prev) => {
      const next = { ...prev };
      if (userSelectedEmoji && next[userSelectedEmoji] > 0) {
        next[userSelectedEmoji] -= 1;
      }
      if (!isAlreadySelected) {
        next[emojiKey] = (next[emojiKey] || 0) + 1;
      }
      return next;
    });
    setUserSelectedEmoji(nextSelected);

    // eventId가 존재하면 백엔드 좋아요 API(PUT/DELETE) 호출 후 서버 카운트 동기화
    if (eventId) {
      setIsSubmittingLike(true);
      try {
        const res = isAlreadySelected
          ? await removePhotoReaction(eventId, photo.id)
          : await addPhotoReaction(eventId, photo.id);

        setReactions((prev) => ({
          ...prev,
          heart: Number(res.likeCount ?? prev.heart),
        }));
        setUserSelectedEmoji(res.likedByMe ? emojiKey : null);

        if (onReactionToggle) {
          onReactionToggle(photo.id, emojiKey, {
            likeCount: Number(res.likeCount ?? 0),
            likedByMe: Boolean(res.likedByMe),
          });
        }
      } catch (error) {
        console.error('[PhotoDetailModal] 좋아요 API 처리 실패:', error);
      } finally {
        setIsSubmittingLike(false);
      }
      return;
    }

    if (onReactionToggle) {
      onReactionToggle(photo.id, emojiKey);
    }
  };

  // ==========================================================================
  // 3. 원본 사진 다운로드 및 메타 일시 포맷팅
  // ==========================================================================
  const handleDownload = () => {
    if (!allowDownload || !displayUrl) return;
    const link = document.createElement('a');
    link.href = displayUrl;
    link.download = `moment_${photo.id}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatMetaDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '행사 진행 중';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${mm}.${dd} ${hh}:${min}`;
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
            {displayUrl && <img src={displayUrl} alt="상세 사진" />}
          </PhotoFrame>

          {/* 3. 공통 Avatar 컴포넌트 + 업로더 닉네임 + 촬영 일시 */}
          <UploaderRow>
            <Avatar name={uploaderName} />
            <UploaderMeta>
              <UploaderName>{uploaderName}</UploaderName>
              <SubInfo>{formatMetaDate(capturedAt)}</SubInfo>
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
                  disabled={isSubmittingLike}
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