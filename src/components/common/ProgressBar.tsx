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
 * 업로드 진행률 바 컴포넌트 (0 ~ 100%)
 */
export const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <Track>
    <Fill $progress={Math.min(100, Math.max(0, progress))} />
  </Track>
);