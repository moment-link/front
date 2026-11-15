/**
 * @file EventAlbumPage.tsx
 * @description P-02 참가자 공유 앨범 페이지 (양끝 복제본 기반 무한 루프 슬라이드 적용)
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  getAlbumPhotos,
  addPhotoReaction,
} from '../../services/participantApi';
import type { AlbumPhoto } from '../../types/participant';
import { PhotoDetailModal } from '../../components/participant/PhotoDetailModal';
import {
  Button,
  SegmentedTab,
  Icon,
  LiveIndicator,
  EmptyState,
} from '../../components/common';
import { typography } from '../../styles/typography';

// 8개 그리드 타일 전용 그라디언트 팔레트
const ALBUM_TILE_GRADIENTS = [
  'linear-gradient(145deg, #565b6e 0%, #2a314d 100%)',
  'linear-gradient(145deg, #6c7082 0%, #3d435c 100%)',
  'linear-gradient(145deg, #273df2 0%, #19279c 100%)',
  'linear-gradient(145deg, #2d43c9 0%, #1d2a7a 100%)',
  'linear-gradient(145deg, #565b6e 0%, #2a314d 100%)',
  'linear-gradient(145deg, #6c7082 0%, #3d435c 100%)',
  'linear-gradient(145deg, #273df2 0%, #19279c 100%)',
  'linear-gradient(145deg, #2d43c9 0%, #1d2a7a 100%)',
];

// 상단 포토월 슬라이드 5장별 배경 그라디언트
const BANNER_SLIDE_GRADIENTS = [
  'linear-gradient(165deg, #2b44ff 0%, #17237a 58%, #121526 100%)',
  'linear-gradient(165deg, #1b2cc1 0%, #2a314d 60%, #121526 100%)',
  'linear-gradient(165deg, #3b5bdb 0%, #19279c 58%, #121526 100%)',
  'linear-gradient(165deg, #273df2 0%, #3d435c 60%, #121526 100%)',
  'linear-gradient(165deg, #22398c 0%, #1a2853 60%, #121526 100%)',
];

export const EventAlbumPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<AlbumPhoto | null>(null);

  /**
   * 무한 루프 슬라이드용 트랙 인덱스 (trackIndex)
   * 배열 구조: [5번 복제(idx:0), 1번(idx:1), 2번(idx:2), 3번(idx:3), 4번(idx:4), 5번(idx:5), 1번 복제(idx:6)]
   * 따라서 시작 위치는 1번 슬라이드인 trackIndex = 1 입니다.
   */
  const [trackIndex, setTrackIndex] = useState(1);
  const [enableTransition, setEnableTransition] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startXRef = useRef<number | null>(null);
  const movedRef = useRef<boolean>(false);

  const currentNickname = sessionStorage.getItem('currentNickname') || '게스트';

  useEffect(() => {
    if (!eventId || isNaN(Number(eventId))) {
      setErrorMsg('유효하지 않은 행사 ID입니다.');
      setLoading(false);
      return;
    }

    const fetchPhotos = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const data = await getAlbumPhotos(Number(eventId), sort);
        setPhotos(data || []);
      } catch (err: any) {
        setErrorMsg(
          err.response?.data?.message || '사진 목록을 불러오는 중 오류가 발생했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [eventId, sort]);

  // 포토월 슬라이드용 상위 반응 사진 최대 5장
  const topPhotos = useMemo(() => {
    return [...photos]
      .sort((a, b) => {
        const sumA = Object.values(a.reactions || {}).reduce((acc, cur) => acc + cur, 0);
        const sumB = Object.values(b.reactions || {}).reduce((acc, cur) => acc + cur, 0);
        return sumB - sumA;
      })
      .slice(0, 5);
  }, [photos]);

  const slideCount = topPhotos.length;

  // 앞뒤에 마지막 사진과 첫 번째 사진 복제본을 추가한 확장 배열 생성
  const extendedSlides = useMemo(() => {
    if (slideCount === 0) return [];
    if (slideCount === 1) return [{ photo: topPhotos[0], realIndex: 0 }];

    const firstClone = { photo: topPhotos[0], realIndex: 0 };
    const lastClone = { photo: topPhotos[slideCount - 1], realIndex: slideCount - 1 };
    const middleItems = topPhotos.map((photo, idx) => ({ photo, realIndex: idx }));

    return [lastClone, ...middleItems, firstClone];
  }, [topPhotos, slideCount]);

  // 현재 화면에 표시 중인 실제 사진 인덱스 (0 ~ slideCount-1)
  const activeRealIndex = useMemo(() => {
    if (slideCount <= 1) return 0;
    if (trackIndex === 0) return slideCount - 1;
    if (trackIndex === slideCount + 1) return 0;
    return trackIndex - 1;
  }, [trackIndex, slideCount]);

  // 슬라이드 이동 함수
  const moveToTrackIndex = (nextIndex: number) => {
    if (slideCount <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setEnableTransition(true);
    setTrackIndex(nextIndex);
  };

  // 복제본(0번 또는 slideCount+1번)에 도달했을 때 애니메이션이 끝난 직후 실제 위치로 순간 이동
  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (slideCount <= 1) return;

    if (trackIndex === 0) {
      // 맨 앞의 '5번 복제본'에 도착 -> 트랜지션 끄고 실제 5번(slideCount) 위치로 즉시 점프
      setEnableTransition(false);
      setTrackIndex(slideCount);
    } else if (trackIndex === slideCount + 1) {
      // 맨 뒤의 '1번 복제본'에 도착 -> 트랜지션 끄고 실제 1번(1) 위치로 즉시 점프
      setEnableTransition(false);
      setTrackIndex(1);
    }
  };

  // 4초 간격 자동 다음 슬라이드 이동 (5번 -> 1번 복제본으로 한 칸만 자연스럽게 전진)
  useEffect(() => {
    if (slideCount <= 1 || isDragging) return;
    const timer = setInterval(() => {
      moveToTrackIndex(trackIndex + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [slideCount, isDragging, trackIndex, isTransitioning]);

  // 터치/마우스 드래그 시작
  const handleDragStart = (clientX: number) => {
    if (slideCount <= 1 || isTransitioning) return;
    startXRef.current = clientX;
    movedRef.current = false;
    setIsDragging(true);
    setEnableTransition(false);
  };

  // 터치/마우스 이동 중
  const handleDragMove = (clientX: number) => {
    if (!isDragging || startXRef.current === null) return;
    const deltaX = clientX - startXRef.current;
    if (Math.abs(deltaX) > 6) {
      movedRef.current = true;
    }
    setDragOffset(deltaX);
  };

  // 터치/마우스 종료
  const handleDragEnd = () => {
    if (!isDragging) return;

    const threshold = 45;
    setIsDragging(false);
    setDragOffset(0);
    startXRef.current = null;

    if (dragOffset < -threshold) {
      // 왼쪽으로 밀기 -> 오른쪽 슬라이드(다음)로 한 칸 이동
      moveToTrackIndex(trackIndex + 1);
    } else if (dragOffset > threshold) {
      // 오른쪽으로 밀기 -> 왼쪽 슬라이드(이전)로 한 칸 이동
      moveToTrackIndex(trackIndex - 1);
    } else {
      // 제자리 복귀
      setEnableTransition(true);
    }
  };

  const handleSlideClick = (photo: AlbumPhoto) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    setSelectedPhoto(photo);
  };

  const handleReactionToggle = async (photoId: string | number, emojiKey: string) => {
    if (!eventId) return;
    try {
      await addPhotoReaction(Number(eventId), photoId);
      setPhotos((prevPhotos) =>
        prevPhotos.map((p) => {
          if (String(p.id) === String(photoId)) {
            const currentCount = p.reactions?.[emojiKey as keyof typeof p.reactions] || 0;
            return {
              ...p,
              reactions: {
                ...p.reactions,
                [emojiKey]: currentCount + 1,
              },
            };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('이모지 반응 처리 실패:', error);
    }
  };

  return (
    <PageContainer>
      {/* 1. 상단 헤더 */}
      <TopHeaderRow>
        <EventTitle>2026 가을 워크숍</EventTitle>
        <GuestBadge>
          <Icon icon="User" $size={13} $color="text2" />
          <span>{currentNickname}</span>
        </GuestBadge>
      </TopHeaderRow>

      {/* 2. 상단 실시간 포토월 무한 루프 슬라이드 뷰포트 */}
      <PhotowallViewport
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => isDragging && handleDragEnd()}
      >
        <FixedTopPill>
          <LiveIndicator />
          <span>실시간 포토월 · 반응 좋은 사진</span>
        </FixedTopPill>

        <FixedIndicatorDots onClick={(e) => e.stopPropagation()}>
          {topPhotos.map((photo, idx) => (
            <Dot
              key={photo.id}
              $active={idx === activeRealIndex}
              onClick={() => moveToTrackIndex(idx + 1)}
            />
          ))}
        </FixedIndicatorDots>

        <SlideTrack
          $index={slideCount <= 1 ? 0 : trackIndex}
          $dragOffset={dragOffset}
          $enableTransition={enableTransition && !isDragging}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedSlides.map((item, idx) => {
            const { photo: slidePhoto, realIndex } = item;
            const reactionSum = Object.values(slidePhoto.reactions || {}).reduce(
              (acc, cur) => acc + cur,
              0
            );
            return (
              <SlideItem
                key={`${slidePhoto.id}_clone_${idx}`}
                $bgUrl={slidePhoto.url}
                $bgGradient={BANNER_SLIDE_GRADIENTS[realIndex % BANNER_SLIDE_GRADIENTS.length]}
                onClick={() => handleSlideClick(slidePhoto)}
              >
                <SlideContentOverlay>
                  <BannerMeta>
                    {slidePhoto.uploaderName || '익명 참가자'} · 반응 {reactionSum}
                  </BannerMeta>
                </SlideContentOverlay>
              </SlideItem>
            );
          })}
        </SlideTrack>
      </PhotowallViewport>

      {/* 3. 2열 액션 버튼 */}
      <ActionButtonGrid>
        <Button
          $variant="primary"
          $size="large"
          onClick={() => navigate(`/event/${eventId}/upload`)}
        >
          <Icon icon="ArrowUp" $size={16} />
          <span>업로드</span>
        </Button>
        <Button
          $variant="secondary"
          $size="large"
          onClick={() => navigate(`/event/${eventId}/upload?mode=camera`)}
        >
          <Icon icon="Camera" $size={16} />
          <span>촬영</span>
        </Button>
      </ActionButtonGrid>

      {/* 4. 정렬 탭(최신순/인기순) + 우측 Moment 카드 › 링크 */}
      <FilterRow>
        <TabBox>
          <SegmentedTab
            options={[
              { key: 'latest', label: '최신순' },
              { key: 'popular', label: '인기순' },
            ]}
            activeKey={sort}
            onChange={(key) => setSort(key as 'latest' | 'popular')}
          />
        </TabBox>

        <MomentCardLink onClick={() => navigate(`/event/${eventId}/moments`)}>
          <span>Moment 카드 ›</span>
        </MomentCardLink>
      </FilterRow>

      {/* 5. 3열 정사각형 사진 그리드 */}
      {loading ? (
        <StateMessage>사진을 불러오는 중입니다...</StateMessage>
      ) : errorMsg ? (
        <StateMessage style={{ color: '#c2d4fe' }}>{errorMsg}</StateMessage>
      ) : photos.length === 0 ? (
        <EmptyState message="아직 등록된 사진이 없습니다." iconName="Image" />
      ) : (
        <PhotoGrid3Col>
          {photos.map((photo, index) => {
            const showVideoBadge = index === 1;
            return (
              <GridThumbCard
                key={photo.id}
                $bgGradient={ALBUM_TILE_GRADIENTS[index % ALBUM_TILE_GRADIENTS.length]}
                onClick={() => setSelectedPhoto(photo)}
              >
                {photo.url && <img src={photo.url} alt={photo.uploaderName} />}
                {showVideoBadge && (
                  <VideoBadge>
                    <PlayTriangle />
                  </VideoBadge>
                )}
                <ThumbOverlay>
                  <UploaderLabel>{photo.uploaderName || '익명 참가자'}</UploaderLabel>
                </ThumbOverlay>
              </GridThumbCard>
            );
          })}
        </PhotoGrid3Col>
      )}

      {/* 6. 하단 각주 안내 */}
      <BottomCaption>
        승인된 사진만 노출 · 작성자는 설정된 닉네임 또는 익명으로 표기
      </BottomCaption>

      {/* 사진 상세 모달 */}
      {selectedPhoto && (
        <PhotoDetailModal
          photo={selectedPhoto}
          allowDownload={true}
          onClose={() => setSelectedPhoto(null)}
          onReactionToggle={(id, emoji) => handleReactionToggle(id, emoji)}
        />
      )}
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

const TopHeaderRow = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const EventTitle = styled.h1`
  ${typography.page}
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const GuestBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
`;

const PhotowallViewport = styled.div`
  width: 100%;
  height: 210px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  margin-bottom: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  touch-action: pan-y;
  user-select: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const SlideTrack = styled.div<{
  $index: number;
  $dragOffset: number;
  $enableTransition: boolean;
}>`
  display: flex;
  width: 100%;
  height: 100%;
  will-change: transform;
  transform: ${({ $index, $dragOffset }) =>
    `translate3d(calc(-${$index * 100}% + ${$dragOffset}px), 0, 0)`};
  transition: ${({ $enableTransition }) =>
    $enableTransition ? 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)' : 'none'};
`;

const SlideItem = styled.div<{ $bgUrl?: string; $bgGradient: string }>`
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
  background: ${({ $bgUrl, $bgGradient }) =>
    $bgUrl
      ? `linear-gradient(180deg, rgba(22, 24, 38, 0.15) 0%, rgba(22, 24, 38, 0.85) 100%), url(${$bgUrl}) center/cover no-repeat`
      : $bgGradient};
`;

const SlideContentOverlay = styled.div`
  position: absolute;
  inset: 0;
  padding: 16px;
  display: flex;
  align-items: flex-end;
`;

const FixedTopPill = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: rgba(16, 18, 35, 0.65);
  backdrop-filter: blur(6px);
  pointer-events: none;
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text};
`;

const FixedIndicatorDots = styled.div`
  position: absolute;
  bottom: 18px;
  right: 16px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BannerMeta = styled.span`
  ${typography.body}
  color: ${({ theme }) => theme.colors.text};
`;

const Dot = styled.span<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? '8px' : '6px')};
  height: ${({ $active }) => ($active ? '8px' : '6px')};
  border-radius: 50%;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.accentLine : 'rgba(255, 255, 255, 0.3)'};
  cursor: pointer;
  transition: all 0.25s ease;
`;

const ActionButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
`;

const FilterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
`;

const TabBox = styled.div`
  width: 150px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 2px;
  background-color: ${({ theme }) => theme.colors.bg};
`;

const MomentCardLink = styled.button`
  background: none;
  border: none;
  padding: 4px 0;
  ${typography.label}
  color: ${({ theme }) => theme.colors.accentLine};
  cursor: pointer;
`;

const PhotoGrid3Col = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const GridThumbCard = styled.div<{ $bgGradient: string }>`
  aspect-ratio: 1;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background: ${({ $bgGradient }) => $bgGradient};

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

const ThumbOverlay = styled.div`
  position: absolute;
  inset: 0;
  padding: 8px 10px;
  display: flex;
  align-items: flex-end;
`;

const UploaderLabel = styled.span`
  ${typography.micro}
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StateMessage = styled.div`
  ${typography.body}
  color: ${({ theme }) => theme.colors.text2};
  text-align: center;
  padding: 48px 0;
`;

const BottomCaption = styled.p`
  ${typography.micro}
  color: ${({ theme }) => theme.colors.text3};
  text-align: left;
  margin-top: 16px;
`;