import styled, { keyframes } from 'styled-components';

/* 로딩 깜빡임 애니메이션 */
const shimmer = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
`;

/**
 * 로딩 상태 UI 스켈레톤 플레이스홀더 컴포넌트
 * @param $width 너비 (기본값: '100%')
 * @param $height 높이 (기본값: '20px')
 * @param $radius 모서리 둥글기 (기본값: '4px')
 * @example
 * <Skeleton $width="100%" $height="180px" $radius="12px" />
 */
export const Skeleton = styled.div<{ $width?: string; $height?: string; $radius?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '20px'};
  border-radius: ${({ $radius }) => $radius || '4px'};
  background-color: ${({ theme }) => theme.colors.surface};
  animation: ${shimmer} 1.5s infinite ease-in-out;
`;