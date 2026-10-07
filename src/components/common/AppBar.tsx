import React from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px; /* Figma 스펙: 높이 52px */
  padding: 0 16px;
  background-color: ${({ theme }) => theme.colors.bg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h1`
  ${typography.appbar} /* 16px / 1.3 / 500 */
  color: ${({ theme }) => theme.colors.text};
`;

/**
 * 상단 네비게이션 헤더(App bar) 컴포넌트
 */
export const AppBar: React.FC<{ title: string; leftAction?: React.ReactNode; rightAction?: React.ReactNode }> = ({
  title,
  leftAction,
  rightAction,
}) => (
  <Header>
    <div>{leftAction}</div>
    <Title>{title}</Title>
    <div>{rightAction}</div>
  </Header>
);