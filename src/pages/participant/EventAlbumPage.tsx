/**
 * @file EventAlbumPage.tsx
 * @description P-02 참가자 공유 앨범 페이지 (행사명 실시간 동기화 + 무한 루프 포토월 슬라이드 + 정렬 필터 + 상세 모달 좋아요 동기화 + 닉네임 변경)
 * @note
 * - 상단 행사명(eventName)은 입장 시 저장된 sessionStorage 및 GET /api/v1/events/access 응답과 동기화되어 입장 화면과 동일한 행사명을 표시합니다.
 * - 상단 실시간 포토월(photowallPhotos)과 하단 3열 그리드(photos) 상태를 분리하여,
 *   정렬 탭(최신순/인기순) 전환 시 상단 포토월이 불필요하게 재로딩되지 않도록 구성했습니다.
 * - 실시간 포토월은 주최자 공개 승인(APPROVED)된 사진 중 반응 수 상위 최대 5장을 노출합니다.
 * - PhotoDetailModal에서 발생한 좋아요 등록/취소 결과를 받아 목록 및 포토월 상태와 실시간 동기화합니다.
 * - 우측 상단 닉네임 배지 클릭 시 PATCH /api/v1/participant/{eventId}/me 로 닉네임을 변경하고 목록을 갱신합니다.
 */

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  getAlbumPhotos,
  getParticipantMe,
  getPublicEventInfo,
  updateParticipantNickname,
} from '../../services/participantApi';
import type { AlbumPhoto } from '../../types/participant';
import { PhotoDetailModal } from '../../components/participant/PhotoDetailModal';
import {
  Button,
  SegmentedTab,
  Icon,
  LiveIndicator,
  EmptyState,
  Modal,
  TextField,
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

type ExtendedAlbumPhoto = AlbumPhoto & { likedByMe?: boolean; mediaType?: string };

export const EventAlbumPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // 입장 화면(EventJoinPage)과 동일한 실제 행사명 상태
  const [eventName, setEventName] = useState<string>(() => {
    const savedEventId = sessionStorage.getItem('currentEventId');
    const savedEventName = sessionStorage.getItem('currentEventName');
    if (savedEventId === eventId && savedEventName) {
      return savedEventName;
    }
    return '공유 앨범';
  });

  // 하단 3열 그리드 전용 사진 목록 상태 (sort 탭 전환에 반응)
  const [photos, setPhotos] = useState<ExtendedAlbumPhoto[]>([]);
  // 상단 실시간 포토월 전용 사진 목록 상태 (sort 탭 전환과 독립 유지)
  const [photowallPhotos, setPhotowallPhotos] = useState<ExtendedAlbumPhoto[]>([]);

  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<ExtendedAlbumPhoto | null>(null);

  // 참가자 닉네임 및 변경 모달 상태
  const [currentNickname, setCurrentNickname] = useState<string>(
    () => sessionStorage.getItem('currentNickname') || '게스트'
  );
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [isUpdatingNickname, setIsUpdatingNickname] = useState(false);

  /**
   * 무한 루프 슬라이드용 트랙 인덱스 (trackIndex)
   * 배열 구조: [5번 복제(idx:0), 1번(idx:1), 2번(idx:2), 3번(idx:3), 4번(idx:4), 5번(idx:5), 1번 복제(idx:6)]
   */
  const [trackIndex, setTrackIndex] = useState(1);
  const [enableTransition, setEnableTransition] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startXRef = useRef<number | null>(null);
  const movedRef = useRef<boolean>(false);

  // ==========================================================================
  // 1. 현재 행사명(GET /events/access) 및 내 참가자 프로필(GET /me) 동기화
  // ==========================================================================
  useEffect(() => {
    if (!eventId || isNaN(Number(eventId))) return;

    let isMounted = true;
    const numericEventId = Number(eventId);

    // 같은 SPA 세션 내에서 eventId가 변경된 경우 저장된 행사명 즉시 선반영
    const savedEventId = sessionStorage.getItem('currentEventId');
    const savedEventName = sessionStorage.getItem('currentEventName');
    if (savedEventId === eventId && savedEventName) {
      setEventName(savedEventName);
    }

    // 1-1. 저장된 shareKey로 실제 행사명 최신화 (eventId 일치 검증)
    const savedShareKey = sessionStorage.getItem('currentShareKey');
    if (savedShareKey) {
      getPublicEventInfo(savedShareKey)
        .then((info) => {
          if (!isMounted || !info) return;
          if (Number(info.eventId) === numericEventId && info.name) {
            setEventName(info.name);
            sessionStorage.setItem('currentEventId', String(numericEventId));
            sessionStorage.setItem('currentEventName', info.name);
          }
        })
        .catch(() => {
          // shareKey 조회 실패 시 sessionStorage에 보존된 eventName 유지
        });
    }

    // 1-2. 현재 세션의 서버 닉네임 동기화
    getParticipantMe(numericEventId).then((profile) => {
      if (!isMounted || !profile?.displayName) return;
      setCurrentNickname(profile.displayName);
      sessionStorage.setItem('currentNickname', profile.displayName);
      localStorage.setItem('participantNickname', profile.displayName);
    });

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  // ==========================================================================
  // 2. 상단 실시간 포토월 데이터 독립 조회 (eventId 변경 시에만 실행, 정렬 탭 무관)
  // ==========================================================================
  const fetchPhotowallPhotos = useCallback(async () => {
    if (!eventId || isNaN(Number(eventId))) return;

    try {
      const data = await getAlbumPhotos(Number(eventId), 'popular', 0, 10);
      const sortedTop = [...((data as ExtendedAlbumPhoto[]) || [])]
        .sort((a, b) => {
          const sumA = Object.values(a.reactions || {}).reduce((acc, cur) => acc + cur, 0);
          const sumB = Object.values(b.reactions || {}).reduce((acc, cur) => acc + cur, 0);
          return sumB - sumA;
        })
        .slice(0, 5);
      setPhotowallPhotos(sortedTop);
    } catch (err) {
      console.warn('[EventAlbumPage] 실시간 포토월 조회 경고:', err);
    }
  }, [eventId]);

  useEffect(() => {
    fetchPhotowallPhotos();
  }, [fetchPhotowallPhotos]);

  // ==========================================================================
  // 3. 하단 공유 앨범 3열 그리드 조회 (정렬 탭 전환 시 그리드만 재조회)
  // ==========================================================================
  const fetchPhotos = useCallback(
    async (showLoader = true) => {
      if (!eventId || isNaN(Number(eventId))) {
        setErrorMsg('유효하지 않은 행사 ID입니다.');
        setLoading(false);
        return;
      }

      if (showLoader) setLoading(true);
      setErrorMsg(null);
      try {
        const data = await getAlbumPhotos(Number(eventId), sort);
        setPhotos((data as ExtendedAlbumPhoto[]) || []);
      } catch (err: any) {
        setErrorMsg(
          err.response?.data?.message || '사진 목록을 불러오는 중 오류가 발생했습니다.'
        );
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [eventId, sort]
  );

  useEffect(() => {
    fetchPhotos(true);
  }, [fetchPhotos]);

  // ==========================================================================
  // 4. 닉네임 변경 모달 열기 및 서버 저장 핸들러 (PATCH /me)
  // ==========================================================================
  const handleOpenNicknameModal = () => {
    setNicknameInput(currentNickname === '게스트' ? '' : currentNickname);
    setNicknameError(null);
    setIsNicknameModalOpen(true);
  };

  const handleNicknameSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!eventId || isNaN(Number(eventId)) || isUpdatingNickname) return;

    const trimmed = nicknameInput.trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      setNicknameError('닉네임은 앞뒤 공백을 제외하고 2~20자로 입력해 주세요.');
      return;
    }

    // 기존 닉네임과 동일하면 불필요한 재조회 없이 즉시 닫기
    if (trimmed === currentNickname) {
      setIsNicknameModalOpen(false);
      return;
    }

    setIsUpdatingNickname(true);
    setNicknameError(null);

    try {
      const updated = await updateParticipantNickname(Number(eventId), trimmed);
      const nextName = updated.displayName || trimmed;

      setCurrentNickname(nextName);
      sessionStorage.setItem('currentNickname', nextName);
      localStorage.setItem('participantNickname', nextName);
      setIsNicknameModalOpen(false);

      // 기존에 업로드한 사진의 작성자 닉네임도 즉시 반영되도록 그리드 및 포토월 무음 재조회
      await Promise.all([fetchPhotos(false), fetchPhotowallPhotos()]);
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      if (status === 409) {
        setNicknameError(
          serverMsg || '현재 행사에서 이미 사용 중인 닉네임이에요. 다른 닉네임을 입력해 주세요.'
        );
      } else if (status === 400) {
        setNicknameError(
          serverMsg || '닉네임 형식이 올바르지 않거나 변경할 수 없는 상태입니다.'
        );
      } else {
        setNicknameError('닉네임 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setIsUpdatingNickname(false);
    }
  };

  // ==========================================================================
  // 5. 상단 포토월 무한 루프 슬라이드 계산 및 제스처 제어
  // ==========================================================================
  const topPhotos = photowallPhotos;
  const slideCount = topPhotos.length;

  const extendedSlides = useMemo(() => {
    if (slideCount === 0) return [];
    if (slideCount === 1) return [{ photo: topPhotos[0], realIndex: 0 }];

    const firstClone = { photo: topPhotos[0], realIndex: 0 };
    const lastClone = { photo: topPhotos[slideCount - 1], realIndex: slideCount - 1 };
    const middleItems = topPhotos.map((photo, idx) => ({ photo, realIndex: idx }));

    return [lastClone, ...middleItems, firstClone];
  }, [topPhotos, slideCount]);

  const activeRealIndex = useMemo(() => {
    if (slideCount <= 1) return 0;
    if (trackIndex === 0) return slideCount - 1;
    if (trackIndex === slideCount + 1) return 0;
    return trackIndex - 1;
  }, [trackIndex, slideCount]);

  const moveToTrackIndex = (nextIndex: number) => {
    if (slideCount <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setEnableTransition(true);
    setTrackIndex(nextIndex);
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (slideCount <= 1) return;

    if (trackIndex === 0) {
      setEnableTransition(false);
      setTrackIndex(slideCount);
    } else if (trackIndex === slideCount + 1) {
      setEnableTransition(false);
      setTrackIndex(1);
    }
  };

  useEffect(() => {
    if (slideCount <= 1 || isDragging) return;
    const timer = setInterval(() => {
      moveToTrackIndex(trackIndex + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [slideCount, isDragging, trackIndex, isTransitioning]);

  const handleDragStart = (clientX: number) => {
    if (slideCount <= 1 || isTransitioning) return;
    startXRef.current = clientX;
    movedRef.current = false;
    setIsDragging(true);
    setEnableTransition(false);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || startXRef.current === null) return;
    const deltaX = clientX - startXRef.current;
    if (Math.abs(deltaX) > 6) {
      movedRef.current = true;
    }
    setDragOffset(deltaX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    const threshold = 45;
    setIsDragging(false);
    setDragOffset(0);
    startXRef.current = null;

    if (dragOffset < -threshold) {
      moveToTrackIndex(trackIndex + 1);
    } else if (dragOffset > threshold) {
      moveToTrackIndex(trackIndex - 1);
    } else {
      setEnableTransition(true);
    }
  };

  const handleSlideClick = (photo: ExtendedAlbumPhoto) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    setSelectedPhoto(photo);
  };

  // ==========================================================================
  // 6. 상세 모달의 좋아요 변경 결과를 하단 그리드와 상단 포토월에 동시 반영
  // ==========================================================================
  const handleReactionSync = (
    photoId: string | number,
    emojiKey: string,
    serverState?: { likeCount: number; likedByMe: boolean }
  ) => {
    const applyUpdate = (list: ExtendedAlbumPhoto[]) =>
      list.map((p) => {
        if (String(p.id) !== String(photoId)) return p;

        if (serverState) {
          return {
            ...p,
            likedByMe: serverState.likedByMe,
            reactions: {
              ...p.reactions,
              heart: serverState.likeCount,
            },
          };
        }

        const currentCount = p.reactions?.[emojiKey as keyof typeof p.reactions] || 0;
        return {
          ...p,
          reactions: {
            ...p.reactions,
            [emojiKey]: currentCount + 1,
          },
        };
      });

    setPhotos(applyUpdate);
    setPhotowallPhotos(applyUpdate);
  };

  return (
    <PageContainer>
      {/* 1. 상단 헤더 (실제 행사명 표출 + 우측 닉네임 배지 클릭 시 변경 모달 오픈) */}
      <TopHeaderRow>
        <EventTitle>{eventName}</EventTitle>
        <GuestBadgeButton
          type="button"
          onClick={handleOpenNicknameModal}
          aria-label="닉네임 변경"
          title="클릭하여 닉네임 변경"
        >
          <Icon icon="User" $size={13} $color="text2" />
          <NicknameText>{currentNickname}</NicknameText>
          <EditPencilIcon viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L4.99967 13.6667L1.33301 14.6667L2.33301 11L11.333 2.00004Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </EditPencilIcon>
        </GuestBadgeButton>
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
            const showVideoBadge = photo.mediaType === 'VIDEO';
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

      {/* 7. 사진 상세 모달 (eventId 전달로 상세 조회 및 좋아요 API 활성화) */}
      {selectedPhoto && (
        <PhotoDetailModal
          eventId={Number(eventId)}
          photo={selectedPhoto}
          allowDownload={true}
          onClose={() => setSelectedPhoto(null)}
          onReactionToggle={handleReactionSync}
        />
      )}

      {/* 8. 참가자 닉네임 변경 모달 */}
      <Modal
        isOpen={isNicknameModalOpen}
        title="닉네임 변경"
        onClose={() => !isUpdatingNickname && setIsNicknameModalOpen(false)}
      >
        <NicknameForm onSubmit={handleNicknameSubmit}>
          <ModalDesc>
            공유 앨범과 업로드한 사진에 표시될 닉네임을 변경할 수 있어요.
          </ModalDesc>
          <TextField
            placeholder="새 닉네임 입력 (2~20자)"
            value={nicknameInput}
            onChange={(e) => {
              setNicknameInput(e.target.value);
              if (nicknameError) setNicknameError(null);
            }}
            maxLength={20}
          />
          {nicknameError ? (
            <ModalErrorText>{nicknameError}</ModalErrorText>
          ) : (
            <ModalGuideText>앞뒤 공백 제외 2~20자 · 행사 내 중복 닉네임 불가</ModalGuideText>
          )}
          <ModalButtonRow>
            <Button
              type="button"
              $variant="secondary"
              $size="medium"
              disabled={isUpdatingNickname}
              onClick={() => setIsNicknameModalOpen(false)}
              style={{ flex: 1 }}
            >
              취소
            </Button>
            <Button
              type="submit"
              $variant="primary"
              $size="medium"
              disabled={isUpdatingNickname}
              style={{ flex: 1 }}
            >
              {isUpdatingNickname ? '변경 중...' : '변경하기'}
            </Button>
          </ModalButtonRow>
        </NicknameForm>
      </Modal>
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
  gap: 12px;
  margin-bottom: 16px;
`;

const EventTitle = styled.h1`
  ${typography.page}
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const GuestBadgeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 160px;
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accentLine};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const NicknameText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EditPencilIcon = styled.svg`
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  opacity: 0.75;
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

const NicknameForm = styled.form`
  display: flex;
  flex-direction: column;
  text-align: left;
`;

const ModalDesc = styled.p`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
  margin: 0 0 12px 0;
  line-height: 1.5;
`;

const ModalGuideText = styled.p`
  ${typography.micro}
  color: ${({ theme }) => theme.colors.text3};
  margin: 8px 0 16px 0;
`;

const ModalErrorText = styled.p`
  ${typography.micro}
  color: #f87171;
  margin: 8px 0 16px 0;
`;

const ModalButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;