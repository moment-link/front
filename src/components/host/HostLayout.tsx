import React from 'react';
import styled from 'styled-components';
import { AppBar, Icon, IconButton } from '../common';

/**
 * HostLayout 컴포넌트 Props 인터페이스
 * @property title 상단 앱바 제목
 * @property onBack 있으면 좌측에 뒤로가기(←) 표시 (목록 → 상세 같은 하위 화면)
 * @property onClose 있으면 좌측에 닫기(✕) 표시 (추가·수정 같은 모달형 화면). onBack과 함께 쓰지 않는다.
 * @property rightAction 앱바 우측 영역 (예: + 버튼, 프로필)
 * @property footer 하단 고정 버튼 영역 (예: 취소 / 저장)
 */
export interface HostLayoutProps {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  rightAction?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  max-width: ${({ theme }) => theme.breakpoints.mobile};
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.bg};
`;

const Content = styled.main`
  flex: 1;
  padding: 16px;
`;

const Footer = styled.footer`
  position: sticky;
  bottom: 0;
  z-index: 100;
  display: flex;
  gap: 8px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background-color: ${({ theme }) => theme.colors.bg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  /* 버튼이 여러 개면 같은 폭으로 나눠 가진다 */
  & > * {
    flex: 1;
  }
`;

/**
 * 주최자 화면 공통 레이아웃 (앱바 + 본문 + 하단 고정 버튼)
 * @example
 * <HostLayout
 *   title="행사 생성"
 *   onBack={() => navigate(-1)}
 *   footer={<><Button $variant="secondary">취소</Button><Button>행사 생성</Button></>}
 * >
 *   ...폼...
 * </HostLayout>
 */
export const HostLayout: React.FC<HostLayoutProps> = ({
  title,
  onBack,
  onClose,
  rightAction,
  footer,
  children,
}) => {
  const leftAction = onBack ? (
    <IconButton onClick={onBack} aria-label="뒤로가기">
      <Icon icon="CaretLeft" />
    </IconButton>
  ) : onClose ? (
    <IconButton onClick={onClose} aria-label="닫기">
      <Icon icon="X" />
    </IconButton>
  ) : undefined;

  return (
    <Page>
      <AppBar title={title} leftAction={leftAction} rightAction={rightAction} />
      <Content>{children}</Content>
      {footer && <Footer>{footer}</Footer>}
    </Page>
  );
};
