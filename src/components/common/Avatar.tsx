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
`;

/**
 * Avatar 컴포넌트 Props 인터페이스
 * @property name 참가자/주최자 닉네임 (첫 글자가 대문자로 원형에 표시됨)
 */
export interface AvatarProps {
  name: string;
}

/**
 * 참가자/주최자 원형 프로필 및 이니셜 표시 컴포넌트
 * @example
 * <Avatar name="민지" />
 */
export const Avatar: React.FC<AvatarProps> = ({ name }) => (
  <Circle>{name ? name.substring(0, 1).toUpperCase() : 'U'}</Circle>
);