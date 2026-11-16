import React from 'react';
import styled from 'styled-components';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HOST_ROUTES } from '../../utils/hostRoutes';
import { typography } from '../../styles/typography';

const Loading = styled.div`
  ${typography.body}
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  background-color: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text3};
`;

/**
 * 로그인한 주최자만 통과시키는 라우트 가드
 * 확인 중: 로딩 표시 (이때 로그인 화면으로 보내면 깜빡이므로 기다린다)
 * 로그인 안 됨: 로그인 화면으로 보낸다. 세션이 끊긴 경우엔 안내 문구용 reason을 같이 넘긴다.
 * @example <Route element={<RequireAuth />}> ...로그인 필요한 라우트... </Route>
 */
export const RequireAuth: React.FC = () => {
  const { status, sessionExpired } = useAuth();

  if (status === 'loading') {
    return <Loading role="status">불러오는 중…</Loading>;
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate
        to={HOST_ROUTES.login}
        replace
        state={sessionExpired ? { reason: 'expired' } : undefined}
      />
    );
  }

  return <Outlet />;
};