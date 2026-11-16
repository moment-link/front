import React from 'react';
import styled from 'styled-components';
import { Navigate } from 'react-router-dom';
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
 * 구글 로그인 후 서버가 돌려보내는 화면 (/oauth/callback)
 * 이 화면은 API를 직접 부르지 않는다. AuthProvider가 시작할 때 이미 세션 복구를 시도하므로,
 * 그 결과(status)만 보고 이동한다. (여기서도 부르면 갱신이 2번 나가 refresh_token 회전과 충돌)
 * 성공 → 행사 목록 / 실패 → 로그인 화면(실패 안내)
 */
export const OAuthCallbackPage: React.FC = () => {
  const { status } = useAuth();

  if (status === 'authenticated') {
    return <Navigate to={HOST_ROUTES.events} replace />;
  }
  if (status === 'unauthenticated') {
    return <Navigate to={HOST_ROUTES.login} replace state={{ reason: 'failed' }} />;
  }
  return <Loading role="status">로그인 확인 중…</Loading>;
};