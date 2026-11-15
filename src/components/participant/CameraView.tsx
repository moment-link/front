/**
 * @file CameraView.tsx
 * @description 모바일 웹 즉석 촬영 뷰파인더 (플래시 제거 + 고속 셔터 + 기본 카메라 전환 + 촬영본 미리보기 모달)
 */

import React, { useState } from 'react';
import type { RefObject } from 'react';
import styled, { keyframes } from 'styled-components';
import { typography } from '../../styles/typography';
import { Button, IconButton, Icon } from '../common';
import { getPlaceholderGradient } from '../../styles/placeholder';
import type { UploadQueueItem } from '../../hooks/useS3Upload';

interface CameraViewProps {
  queue: UploadQueueItem[];
  videoRef?: RefObject<HTMLVideoElement | null>;
  isStreamReady?: boolean;
  isRecording?: boolean;
  recordingSeconds?: number;
  onOpenNativeCamera?: () => void;
  onRemoveItem?: (id: string) => void;
  onClose: () => void;
  onCapture: () => Promise<void> | void;
  onStartRecord?: () => void;
  onStopRecord?: () => void;
  onNext: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  queue,
  videoRef,
  isStreamReady = false,
  isRecording = false,
  recordingSeconds = 0,
  onOpenNativeCamera,
  onRemoveItem,
  onClose,
  onCapture,
  onStartRecord,
  onStopRecord,
  onNext,
}) => {
  const [isShutterEffect, setIsShutterEffect] = useState(false);
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const queueCount = queue.length;
  const latestItem = queueCount > 0 ? queue[queueCount - 1] : null;

  const formatTimer = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleShutterClick = async () => {
    if (!isStreamReady) return;

    if (captureMode === 'photo') {
      // 찰칵 찍혔다는 시각적 피드백을 위한 가벼운 셔터 깜빡임 (0.12초)
      setIsShutterEffect(true);
      setTimeout(() => setIsShutterEffect(false), 120);
      await onCapture();
    } else {
      if (isRecording) {
        onStopRecord?.();
      } else {
        onStartRecord?.();
      }
    }
  };

  const handleOpenPreview = () => {
    if (queueCount === 0) return;
    setPreviewIndex(queueCount - 1);
    setIsPreviewOpen(true);
  };

  const currentPreviewItem = queue[previewIndex] || queue[queue.length - 1] || null;

  return (
    <ViewfinderContainer>
      <ShutterBlinkOverlay $active={isShutterEffect} />

      {/* 1. 상단 바: 좌측 닫기 / 중앙 대기열 N개 / 우측 균형용 여백 */}
      <TopBar>
        <IconButton onClick={onClose} aria-label="닫기">
          <Icon icon="X" $size={22} />
        </IconButton>

        {isRecording ? (
          <RecordingBadge>
            <RecDot />
            <span>REC {formatTimer(recordingSeconds)}</span>
          </RecordingBadge>
        ) : (
          <QueueBadge onClick={handleOpenPreview}>
            대기열 {queueCount}개
          </QueueBadge>
        )}

        <RightSpacer />
      </TopBar>

      {/* 2. 중앙 3x3 격자 뷰파인더 영역 */}
      <ViewfinderBox>
        <VideoElement ref={videoRef} autoPlay playsInline muted />

        {!isStreamReady && (
          <CameraLoadingOverlay>
            <Spinner />
            <LoadingText>카메라를 준비하고 있어요...</LoadingText>
          </CameraLoadingOverlay>
        )}

        <GridOverlay>
          <GridCell />
          <GridCell />
          <GridCell />
          <GridCell />
          <GridCell />
          <GridCell />
          <GridCell />
          <GridCell />
          <GridCell />
        </GridOverlay>

        {onOpenNativeCamera && (
          <NativeCameraFloatingBtn type="button" onClick={onOpenNativeCamera}>
            <Icon icon="Camera" $size={13} />
            <span>기본 카메라로 전환</span>
          </NativeCameraFloatingBtn>
        )}

        <TimestampNotice>촬영 시각이 함께 저장돼요</TimestampNotice>
      </ViewfinderBox>

      {/* 3. 하단 컨트롤 그룹 (여유 있는 패딩 배치) */}
      <BottomSection>
        <ModeSwitchRow>
          <ModeTab
            type="button"
            $active={captureMode === 'photo'}
            disabled={isRecording}
            onClick={() => setCaptureMode('photo')}
          >
            사진
          </ModeTab>
          <ModeTab
            type="button"
            $active={captureMode === 'video'}
            disabled={isRecording}
            onClick={() => setCaptureMode('video')}
          >
            동영상
          </ModeTab>
        </ModeSwitchRow>

        <BottomControls>
          <LatestThumbButton
            type="button"
            $bgGradient={getPlaceholderGradient(0)}
            $hasItem={queueCount > 0}
            onClick={handleOpenPreview}
            aria-label="촬영한 사진 모아보기"
          >
            {latestItem && (
              <>
                {latestItem.file.type.startsWith('video/') ? (
                  <video src={latestItem.previewUrl} muted playsInline />
                ) : (
                  <img src={latestItem.previewUrl} alt="최근 촬영" />
                )}
                <ThumbCountBadge>{queueCount}</ThumbCountBadge>
              </>
            )}
          </LatestThumbButton>

          <ShutterButton
            type="button"
            $isVideo={captureMode === 'video'}
            $isRecording={isRecording}
            disabled={!isStreamReady}
            onClick={handleShutterClick}
            aria-label={captureMode === 'photo' ? '사진 촬영' : '동영상 녹화'}
          />

          <Button
            $variant="primary"
            $size="medium"
            onClick={onNext}
            disabled={isRecording}
          >
            다음
          </Button>
        </BottomControls>
      </BottomSection>

      {/* 4. 촬영한 사진 모아보기/삭제 모달 */}
      {isPreviewOpen && currentPreviewItem && (
        <PreviewModalOverlay onClick={() => setIsPreviewOpen(false)}>
          <PreviewModalCard onClick={(e) => e.stopPropagation()}>
            <PreviewHeader>
              <PreviewTitle>
                촬영한 미디어 ({previewIndex + 1} / {queueCount})
              </PreviewTitle>
              <IconButton onClick={() => setIsPreviewOpen(false)} aria-label="미리보기 닫기">
                <Icon icon="X" $size={20} />
              </IconButton>
            </PreviewHeader>

            <MainPreviewStage>
              {currentPreviewItem.file.type.startsWith('video/') ? (
                <video src={currentPreviewItem.previewUrl} controls playsInline />
              ) : (
                <img src={currentPreviewItem.previewUrl} alt="촬영본 미리보기" />
              )}
            </MainPreviewStage>

            <ThumbStripRow>
              {queue.map((item, idx) => (
                <StripThumbItem
                  key={item.id}
                  $active={idx === previewIndex}
                  onClick={() => setPreviewIndex(idx)}
                >
                  {item.file.type.startsWith('video/') ? (
                    <video src={item.previewUrl} muted playsInline />
                  ) : (
                    <img src={item.previewUrl} alt={`촬영본 ${idx + 1}`} />
                  )}
                </StripThumbItem>
              ))}
            </ThumbStripRow>

            <PreviewActionRow>
              <Button
                $variant="secondary"
                $size="medium"
                onClick={() => {
                  if (!onRemoveItem) return;
                  const targetId = currentPreviewItem.id;
                  onRemoveItem(targetId);
                  if (queueCount <= 1) {
                    setIsPreviewOpen(false);
                  } else if (previewIndex >= queueCount - 1) {
                    setPreviewIndex(Math.max(0, queueCount - 2));
                  }
                }}
              >
                선택 삭제
              </Button>
              <Button
                $variant="primary"
                $size="medium"
                onClick={() => setIsPreviewOpen(false)}
              >
                계속 촬영하기
              </Button>
            </PreviewActionRow>
          </PreviewModalCard>
        </PreviewModalOverlay>
      )}
    </ViewfinderContainer>
  );
};

// ============================================================================
// 스타일 정의
// ============================================================================
const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const ViewfinderContainer = styled.div`
  position: fixed;
  inset: 0;
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  touch-action: none;
  background-color: ${({ theme }) => theme.colors.bg};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 16px calc(env(safe-area-inset-bottom, 12px) + 10px);
  z-index: 999;
`;

const ShutterBlinkOverlay = styled.div<{ $active: boolean }>`
  position: absolute;
  inset: 0;
  background-color: #ffffff;
  pointer-events: none;
  z-index: 50;
  opacity: ${({ $active }) => ($active ? 0.35 : 0)};
  transition: opacity 0.12s ease-out;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 6px;
`;

const RightSpacer = styled.div`
  width: 38px;
  height: 38px;
`;

const QueueBadge = styled.button`
  padding: 5px 14px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  ${typography.label}
  cursor: pointer;
`;

const RecordingBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px;
  border-radius: 20px;
  background-color: rgba(220, 38, 38, 0.2);
  border: 1px solid #ef4444;
  color: #fca5a5;
  ${typography.label}
`;

const RecDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ef4444;
  animation: ${pulseAnimation} 1s infinite;
`;

const ViewfinderBox = styled.div`
  flex: 1;
  min-height: 0;
  margin: 0;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  background: ${getPlaceholderGradient(2)};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const VideoElement = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CameraLoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 4;
  background-color: rgba(22, 24, 38, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: ${({ theme }) => theme.colors.accentLine};
  border-radius: 50%;
  animation: ${spinAnimation} 0.8s linear infinite;
`;

const LoadingText = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
`;

const GridOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  pointer-events: none;
`;

const GridCell = styled.div`
  border: 0.5px solid ${({ theme }) => theme.colors.border};
`;

const NativeCameraFloatingBtn = styled.button`
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: rgba(18, 20, 38, 0.82);
  backdrop-filter: blur(6px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  ${typography.micro}
  cursor: pointer;
`;

const TimestampNotice = styled.span`
  position: absolute;
  bottom: 14px;
  right: 12px;
  ${typography.micro}
  color: ${({ theme }) => theme.colors.text};
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 14px;
  padding-bottom: 4px;
  flex-shrink: 0;
`;

const ModeSwitchRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
`;

const ModeTab = styled.button<{ $active: boolean }>`
  padding: 5px 16px;
  border-radius: 16px;
  ${typography.caption}
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active, theme }) => ($active ? theme.colors.text : theme.colors.text3)};
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.surface : 'transparent'};
  border: 1px solid
    ${({ $active, theme }) => ($active ? theme.colors.accentLine : 'transparent')};
  cursor: pointer;
`;

const BottomControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
`;

const LatestThumbButton = styled.button<{ $bgGradient: string; $hasItem: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  padding: 0;
  background: ${({ $bgGradient }) => $bgGradient};
  border: 1.5px solid
    ${({ $hasItem, theme }) => ($hasItem ? theme.colors.accentLine : theme.colors.border)};
  cursor: ${({ $hasItem }) => ($hasItem ? 'pointer' : 'default')};

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ThumbCountBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ShutterButton = styled.button<{ $isVideo: boolean; $isRecording: boolean }>`
  width: 66px;
  height: 66px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.text};
  background-color: transparent;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.5;
  }

  &::after {
    content: '';
    display: block;
    transition: all 0.2s ease;
    width: ${({ $isRecording }) => ($isRecording ? '24px' : '100%')};
    height: ${({ $isRecording }) => ($isRecording ? '24px' : '100%')};
    border-radius: ${({ $isRecording }) => ($isRecording ? '6px' : '50%')};
    background-color: ${({ $isVideo, theme }) =>
      $isVideo ? '#ef4444' : theme.colors.text};
  }
`;

const PreviewModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1100;
  background-color: rgba(12, 14, 24, 0.88);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const PreviewModalCard = styled.div`
  width: 100%;
  max-width: 420px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PreviewTitle = styled.span`
  ${typography.section}
  color: ${({ theme }) => theme.colors.text};
`;

const MainPreviewStage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 14px;
  overflow: hidden;
  background-color: #0e101a;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ThumbStripRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const StripThumbItem = styled.button<{ $active: boolean }>`
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  padding: 0;
  border: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.accentLine : 'transparent')};
  opacity: ${({ $active }) => ($active ? 1 : 0.55)};
  cursor: pointer;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PreviewActionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 10px;
`;