/**
 * @file PhotoDetailModal.tsx
 * @description P-05 사진 상세 전체 화면 뷰어 (상세 조회 GET, 1인 1반응 동기화, Blob 파일 다운로드)
 * @note
 * - 백엔드 1학기 스펙은 단일 좋아요(likeCount, likedByMe)를 반환하므로,
 *   전체 좋아요 수에서 본인 반응(1)과 타인 반응(likeCount - 1)을 분리 계산하여 4종 이모지 중복 카운트를 방지합니다.
 * - 본인이 선택한 이모지 키는 localStorage에 저장하여 모달 재진입·새로고침 후에도 유지됩니다.
 * - 사진 저장은 외부 S3 URL에서 새 탭 열림을 방지하기 위해 fetch -> Blob 변환 다운로드를 우선 시도합니다.
 */

import React, { useState, useEffect, useMemo } from 'react';
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

type EmojiKey = 'heart' | 'laugh' | 'fire' | 'clap';

const EMOJI_LIST: { key: EmojiKey; symbol: string }[] = [
  { key: 'heart', symbol: '❤️' },
  { key: 'laugh', symbol: '😂' },
  { key: 'fire', symbol: '🔥' },
  { key: 'clap', symbol: '👏' },
];

const isValidEmojiKey = (value: string | null): value is EmojiKey =>
  value === 'heart' || value === 'laugh' || value === 'fire' || value === 'clap';

const getReactionStorageKey = (eventId: number | undefined, mediaId: string | number) =>
  `moment_reaction_${eventId ?? 'local'}_${mediaId}`;

const loadSavedEmoji = (eventId: number | undefined, mediaId: string | number): EmojiKey | null => {
  try {
    const saved = localStorage.getItem(getReactionStorageKey(eventId, mediaId));
    return isValidEmojiKey(saved) ? saved : null;
  } catch {
    return null;
  }
};

const saveSelectedEmoji = (
  eventId: number | undefined,
  mediaId: string | number,
  emoji: EmojiKey | null
) => {
  try {
    const key = getReactionStorageKey(eventId, mediaId);
    if (emoji) {
      localStorage.setItem(key, emoji);
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    // 스토리지 접근 불가 환경 무시
  }
};

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
  const [displayUrl, setDisplayUrl] = useState<string>(photo?.url || '');
  const [downloadFileName, setDownloadFileName] = useState<string>(
    photo ? `moment_${photo.id}.jpg` : 'moment_photo.jpg'
  );
  const [uploaderName, setUploaderName] = useState<string>(photo?.uploaderName || '익명 참가자');
  const [capturedAt, setCapturedAt] = useState<string>(photo?.capturedAt || '');

  // 백엔드 단일 좋아요 기준 상태 (중복 카운트 원천 차단)
  const [serverLikeCount, setServerLikeCount] = useState<number>(photo?.reactions?.heart || 0);
  const [likedByMe, setLikedByMe] = useState<boolean>(Boolean(photo?.likedByMe));
  const [userSelectedEmoji, setUserSelectedEmoji] = useState<EmojiKey | null>(() => {
    if (!photo || !photo.likedByMe) return null;
    return loadSavedEmoji(eventId, photo.id) || 'heart';
  });

  const [isSubmittingLike, setIsSubmittingLike] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // ==========================================================================
  // 1. 모달 진입 시 백엔드 단건 상세 조회(GET .../media/{mediaId}) 호출
  // ==========================================================================
  useEffect(() => {
    if (!photo) return;

    const initialLiked = Boolean(photo.likedByMe);
    const initialCount = Number(photo.reactions?.heart ?? 0);

    setDisplayUrl(photo.url || '');
    setDownloadFileName(`moment_${photo.id}.jpg`);
    setUploaderName(photo.uploaderName || '익명 참가자');
    setCapturedAt(photo.capturedAt);
    setServerLikeCount(initialCount);
    setLikedByMe(initialLiked);
    setUserSelectedEmoji(initialLiked ? loadSavedEmoji(eventId, photo.id) || 'heart' : null);

    if (!eventId || !photo.id) return;

    let isMounted = true;
    const fetchDetail = async () => {
      try {
        const detail = await getGalleryPhotoDetail(eventId, photo.id);
        if (!isMounted || !detail) return;

        if (detail.mediaUrl || detail.thumbnailUrl) {
          setDisplayUrl(detail.mediaUrl || detail.thumbnailUrl || '');
        }
        if (detail.fileName) {
          setDownloadFileName(detail.fileName);
        }
        if (detail.uploaderDisplayName) {
          setUploaderName(detail.uploaderDisplayName);
        }
        if (detail.capturedAt || detail.uploadedAt) {
          setCapturedAt(detail.capturedAt || detail.uploadedAt || photo.capturedAt);
        }

        const nextLiked = Boolean(detail.likedByMe);
        const nextCount = Number(detail.likeCount ?? initialCount);
        setServerLikeCount(nextCount);
        setLikedByMe(nextLiked);

        if (nextLiked) {
          setUserSelectedEmoji(loadSavedEmoji(eventId, photo.id) || 'heart');
        } else {
          setUserSelectedEmoji(null);
          saveSelectedEmoji(eventId, photo.id, null);
        }
      } catch (error) {
        console.warn('[PhotoDetailModal] 상세 조회 폴백 처리:', error);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [eventId, photo]);

  // 전체 좋아요 수에서 본인 몫(1)을 제외한 타인 좋아요 수와 각 이모지별 표시 카운트 계산
  const displayedReactions = useMemo<Record<EmojiKey, number>>(() => {
    const otherLikes = Math.max(0, serverLikeCount - (likedByMe ? 1 : 0));
    return {
      heart: otherLikes + (likedByMe && userSelectedEmoji === 'heart' ? 1 : 0),
      laugh: likedByMe && userSelectedEmoji === 'laugh' ? 1 : 0,
      fire: likedByMe && userSelectedEmoji === 'fire' ? 1 : 0,
      clap: likedByMe && userSelectedEmoji === 'clap' ? 1 : 0,
    };
  }, [serverLikeCount, likedByMe, userSelectedEmoji]);

  if (!photo) return null;

  // ==========================================================================
  // 2. 반응(좋아요) 등록(PUT), 변경(PUT 멱등), 취소(DELETE) 핸들러
  // ==========================================================================
  const handleEmojiClick = async (emojiKey: EmojiKey) => {
    if (isSubmittingLike) return;

    const prevCount = serverLikeCount;
    const prevLiked = likedByMe;
    const prevEmoji = userSelectedEmoji;

    const isCanceling = prevLiked && prevEmoji === emojiKey;
    const nextLiked = !isCanceling;
    const nextEmoji: EmojiKey | null = isCanceling ? null : emojiKey;
    const nextCount = isCanceling
      ? Math.max(0, prevCount - 1)
      : prevLiked
      ? prevCount
      : prevCount + 1;

    // 화면 선반영
    setServerLikeCount(nextCount);
    setLikedByMe(nextLiked);
    setUserSelectedEmoji(nextEmoji);
    saveSelectedEmoji(eventId, photo.id, nextEmoji);

    if (eventId) {
      setIsSubmittingLike(true);
      try {
        const res = isCanceling
          ? await removePhotoReaction(eventId, photo.id)
          : await addPhotoReaction(eventId, photo.id);

        const syncedLiked = Boolean(res.likedByMe);
        const syncedCount = Number(res.likeCount ?? nextCount);
        const syncedEmoji = syncedLiked ? nextEmoji || 'heart' : null;

        setServerLikeCount(syncedCount);
        setLikedByMe(syncedLiked);
        setUserSelectedEmoji(syncedEmoji);
        saveSelectedEmoji(eventId, photo.id, syncedEmoji);

        if (onReactionToggle) {
          onReactionToggle(photo.id, emojiKey, {
            likeCount: syncedCount,
            likedByMe: syncedLiked,
          });
        }
      } catch (error) {
        // 실패 시 이전 상태로 자동 복구
        console.error('[PhotoDetailModal] 좋아요 API 처리 실패:', error);
        setServerLikeCount(prevCount);
        setLikedByMe(prevLiked);
        setUserSelectedEmoji(prevEmoji);
        saveSelectedEmoji(eventId, photo.id, prevEmoji);
      } finally {
        setIsSubmittingLike(false);
      }
      return;
    }

    if (onReactionToggle) {
      onReactionToggle(photo.id, emojiKey, {
        likeCount: nextCount,
        likedByMe: nextLiked,
      });
    }
  };

  // ==========================================================================
  // 3. 원본 사진 파일 직접 다운로드 (Blob 변환 우선, CORS 차단 시 새 탭 폴백)
  // ==========================================================================
  const handleDownload = async () => {
    if (!allowDownload || !displayUrl || isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await fetch(displayUrl, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`이미지 다운로드 실패 (HTTP ${response.status})`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadFileName || `moment_${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 브라우저가 다운로드를 시작할 시간을 확보한 뒤 메모리 해제
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.warn('[PhotoDetailModal] Blob 다운로드 실패(CORS 등), 새 탭 폴백 실행:', error);
      window.open(displayUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setIsDownloading(false);
    }
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
            {EMOJI_LIST.map((item) => {
              const count = displayedReactions[item.key] || 0;
              const isActive = likedByMe && userSelectedEmoji === item.key;
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
                disabled={isDownloading || !displayUrl}
                onClick={handleDownload}
                style={{ width: '100%' }}
              >
                <Icon icon="DownloadSimple" $size={18} />
                <span>{isDownloading ? '저장 중...' : '사진 저장'}</span>
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