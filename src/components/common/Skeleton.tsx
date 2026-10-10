import styled, { keyframes } from 'styled-components';

/* 로딩 깜빡임 애니메이션 */
const shimmer = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
`;

/**
 * 로딩 상태용 스켈레톤 플레이스홀더
 */
export const Skeleton = styled.div<{ $width?: string; $height?: string; $radius?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '20px'};
  border-radius: ${({ $radius }) => $radius || '4px'};
  background-color: ${({ theme }) => theme.colors.surface};
  animation: ${shimmer} 1.5s infinite ease-in-out;
`;