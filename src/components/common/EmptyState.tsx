import React from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';
import { Icon } from './Icon';

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
 * 데이터가 없거나 차단된 상태 안내 컴포넌트 (40px 규격 아이콘 사용)
 */
export const EmptyState: React.FC<{ message: string; iconName?: string }> = ({
  message,
  iconName = 'CameraSlash',
}) => (
  <Container>
    <Icon icon={iconName as any} $size={40}$color="text3" />
    <Title>{message}</Title>
  </Container>
);