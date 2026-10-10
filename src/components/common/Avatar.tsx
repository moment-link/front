import React from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';

const Circle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.sunken};
  color: ${({ theme }) => theme.colors.accentText};
  display: flex;
  align-items: center;
  justify-content: center;
  ${typography.label}
  font-weight: 600;
`;

/**
 * 참가자 원형 프로필/이니셜 이모지 컴포넌트
 */
export const Avatar: React.FC<{ name: string }> = ({ name }) => (
  <Circle>{name ? name.substring(0, 1).toUpperCase() : 'U'}</Circle>
);