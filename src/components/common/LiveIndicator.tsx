import React from 'react';
import styled, { keyframes } from 'styled-components';

/* LIVE 현황 Glow 펄스 애니메이션 */
const pulseGlow = keyframes`
  0% { box-shadow: 0 0 4px #6a91ff; }
  50% { box-shadow: 0 0 12px #6a91ff; }
  100% { box-shadow: 0 0 4px #6a91ff; }
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.status.live.color};
  animation: ${pulseGlow} 2s infinite ease-in-out;
  display: inline-block;
`;

/**
 * 실시간 포토월/현황 표시용 Glow 원형 점 컴포넌트
 */
export const LiveIndicator: React.FC = () => <Dot />;