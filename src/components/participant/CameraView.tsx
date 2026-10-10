import React, { useState } from 'react';
import type { RefObject } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { typography } from '../../styles/typography';
import { Button, IconButton, Icon } from '../common';

const flashAnimation = keyframes`
  0% { opacity: 0.8; }
  100% { opacity: 0; }
`;

const ViewfinderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #000;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  overflow: hidden;
`;

const FlashOverlay = styled.div<{ $isFlashing: boolean }>`
  position: absolute;
  inset: 0;
  background-color: #ffffff;
  pointer-events: none;
  z-index: 50;
  opacity: 0;
  ${({ $isFlashing }) =>
    $isFlashing &&
    css`
      animation: ${flashAnimation} 0.25s ease-out forwards;
    `}
`;

const VideoElement = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 20;
`;

const CloseWrapper = styled.div`
  cursor: pointer;
  z-index: 30;
`;

const QueueBadge = styled.div`
  padding: 6px 16px;
  border-radius: 20px;
  background-color: rgba(21, 23, 38, 0.7);
  color: ${({ theme }) => theme.colors.text};
  ${typography.label}
`;

const FrameGuide = styled.div`
  position: absolute;
  inset: 70px 16px 120px 16px;
  border-radius: 24px;
  border: 1px solid rgba(233, 233, 237, 0.2);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 16px;
  z-index: 5;
`;

const TimestampNotice = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
  padding: 0 16px 20px 16px;
`;

const ShutterButton = styled.button`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 4px solid #e4e7f5;
  background-color: transparent;
  padding: 4px;
  cursor: pointer;

  &::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #e4e7f5;
  }
`;

interface CameraViewProps {
  queueCount: number;
  videoRef?: RefObject<HTMLVideoElement | null>;
  onClose: () => void;
  onCapture: () => void;
  onNext: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  queueCount,
  videoRef,
  onClose,
  onCapture,
  onNext,
}) => {
  const [isFlashing, setIsFlashing] = useState(false);

  const handleShutterClick = () => {
    // 플래시 이펙트 트리거
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 250);

    // 캡처 호출
    onCapture();
  };

  return (
    <ViewfinderContainer>
      <FlashOverlay $isFlashing={isFlashing} />
      <VideoElement ref={videoRef} autoPlay playsInline muted />

      <TopBar>
        <CloseWrapper onClick={onClose}>
          <IconButton aria-label="카메라 닫기">
            <Icon icon="X" $size={20} />
          </IconButton>
        </CloseWrapper>
        <QueueBadge>대기열 {queueCount}장</QueueBadge>
        <IconButton aria-label="플래시">
          <Icon icon="Lightning" $size={20} />
        </IconButton>
      </TopBar>

      <FrameGuide>
        <TimestampNotice>촬영 시각이 함께 기록됩니다</TimestampNotice>
      </FrameGuide>

      <Controls>
        <div style={{ width: '40px' }} />
        <ShutterButton onClick={handleShutterClick} aria-label="촬영하기" />
        <Button $variant="primary" $size="medium" onClick={onNext}>
          다음
        </Button>
      </Controls>
    </ViewfinderContainer>
  );
};