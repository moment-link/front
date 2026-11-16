import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../contexts/authContext';

/**
 * 인증 상태 훅. AuthProvider 안쪽에서만 쓸 수 있음
 * @example const { status, user, logout } = useAuth();
 */
export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있어요.');
  }
  return value;
};