import React from 'react';
import styled from 'styled-components';

const Track = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
`;

const Fill = styled.div<{ $progress: number }>`
  width: ${({ $progress }) => $progress}%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.accentLine};
  transition: width 0.3s ease;
`;

/**
 * ProgressBar 컴포넌트 Props 인터페이스
 * @property progress 진행률 퍼센트 수치 (0 ~ 100)
 */
export interface ProgressBarProps {
  progress: number;
}

/**
 * 사진 및 미디어 업로드 진행 상태 표시바 컴포넌트
 * @example
 * <ProgressBar progress={75} />
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <Track>
    <Fill $progress={Math.min(100, Math.max(0, progress))} />
  </Track>
);