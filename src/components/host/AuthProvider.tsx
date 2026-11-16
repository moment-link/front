import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../../contexts/authContext';
import { fetchMe, requestLogout } from '../../services/authApi';
import { USE_MOCK } from '../../services/config';
import { refreshSession, setAuthFailureHandler } from '../../services/hostClient';
import { clearAccessToken } from '../../services/tokenStore';
import type { AuthStatus, HostUser } from '../../types/auth';

/** 목업 모드에서 로그인된 것처럼 보이게 하는 테스트 주최자 */
const MOCK_USER: HostUser = {
  id: 0,
  email: 'mock@momentlink.org',
  name: '테스트 주최자',
  status: 'ACTIVE',
};

/**
 * 주최자 인증 상태 제공자
 * 앱이 열릴 때 refresh_token 쿠키로 로그인을 복구한다. (갱신 → 내 정보 조회)
 * 이후 API 호출 중 세션이 끊기면 hostClient가 알려주고, 여기서 "로그인 안 됨"으로 바꾼다.
 * 참가자 화면이 이 안에 들어가면 쓸데없이 갱신 요청이 나가므로, 주최자 라우트만 감싼다.
 * @example <Route element={<AuthProvider />}> ...주최자 라우트... </Route>
 */
export const AuthProvider: React.FC = () => {
  // 목업 모드는 처음부터 로그인된 상태로 시작한다. (effect 안에서 state를 바로 바꾸지 않기 위해)
  const [status, setStatus] = useState<AuthStatus>(USE_MOCK ? 'authenticated' : 'loading');
  const [user, setUser] = useState<HostUser | null>(USE_MOCK ? MOCK_USER : null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // 1) 시작 시 세션 복구
  useEffect(() => {
    if (USE_MOCK) return; // 서버 호출 없이 위의 테스트 주최자를 사용

    let cancelled = false; 
    
    const restoreSession = async () => {
      try {
        await refreshSession(); // 같은 시점의 중복 호출은 하나로 합쳐진다.
        const me = await fetchMe();
        if (cancelled) return;
        setUser(me);
        setStatus('authenticated');
      } catch {
        // 상태 코드와 상관없이 실패는 모두 "로그인 안 됨" (네트워크 오류 포함)
        if (cancelled) return;
        clearAccessToken();
        setUser(null);
        setStatus('unauthenticated');
      }
    };

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) 사용 중 세션이 끊기면(갱신 실패) 로그인 안 됨으로 전환
  useEffect(() => {
    setAuthFailureHandler(() => {
      setUser(null);
      setSessionExpired(true);
      setStatus('unauthenticated');
    });
    return () => setAuthFailureHandler(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (!USE_MOCK) await requestLogout();
    } catch {
      // 서버 호출이 실패해도 이 기기에서는 로그아웃 처리한다.
    }
    clearAccessToken();
    setUser(null);
    setSessionExpired(false);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, sessionExpired, logout }),
    [status, user, sessionExpired, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      <Outlet />
    </AuthContext.Provider>
  );
};