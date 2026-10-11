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

const ActionSlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
`;

/**
 * AppBar 컴포넌트 Props 인터페이스
 * @property title 헤더 중앙에 표시될 페이지 타이틀
 * @property leftAction 헤더 좌측에 들어갈 영역 (예: 뒤로가기 IconButton)
 * @property rightAction 헤더 우측에 들어갈 영역 (예: 설정/닫기 IconButton)
 */
export interface AppBarProps {
  title: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

/**
 * 상단 네비게이션 헤더(App bar) 공통 컴포넌트
 * @example
 * <AppBar
 *   title="공유 앨범"
 *   leftAction={<IconButton onClick={handleBack}><Icon icon="CaretLeft" /></IconButton>}
 * />
 */
export const AppBar: React.FC<AppBarProps> = ({
  title,
  leftAction,
  rightAction,
}) => (
  <Header>
    <ActionSlot>{leftAction}</ActionSlot>
    <Title>{title}</Title>
    <ActionSlot>{rightAction}</ActionSlot>
  </Header>
);