// 인증 상태를 담는 Context 객체 

import { createContext } from 'react';
import type { AuthStatus, HostUser } from '../types/auth';

/**
 * @property status 확인 중 / 로그인됨 / 로그인 안 됨
 * @property user 로그인된 주최자 정보 (아니면 null)
 * @property sessionExpired 로그인되어 있다가 세션이 끊긴 경우 true (로그인 화면 안내 문구용)
 * @property logout 로그아웃 (서버 실패와 무관하게 화면은 로그아웃 처리)
 */
export interface AuthContextValue {
  status: AuthStatus;
  user: HostUser | null;
  sessionExpired: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);