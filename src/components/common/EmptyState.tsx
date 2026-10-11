import React from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';
import { Icon } from './Icon';
import type * as PhosphorIcons from '@phosphor-icons/react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  gap: 12px;
  text-align: center;
`;

const Title = styled.p`
  ${typography.empty}
  color: ${({ theme }) => theme.colors.text2};
`;

/**
 * EmptyState 컴포넌트 Props 인터페이스
 * @property message 데이터가 없을 때 표출할 안내 문구
 * @property iconName 표시할 아이콘 이름 (기본값: 'CameraSlash')
 */
export interface EmptyStateProps {
  message: string;
  iconName?: keyof typeof PhosphorIcons;
}

/**
 * 데이터가 없거나 차단된 상태를 안내하는 플레이스홀더 컴포넌트
 * @example
 * <EmptyState message="등록된 사진이 없습니다." iconName="CameraSlash" />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  iconName = 'CameraSlash',
}) => (
  <Container>
    <Icon icon={iconName} $size={40}$color="text3" />
    <Title>{message}</Title>
  </Container>
);