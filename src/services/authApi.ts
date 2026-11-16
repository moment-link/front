// 주최자 인증 API 모음

import type { ApiResponse } from '../types/common';
import type { HostUser } from '../types/auth';
import { API_BASE_URL } from './config';
import { hostClient } from './hostClient';

/**
 * 구글 로그인 시작 URL
 * 반드시 페이지 이동(window.location.href)으로만 사용
 * fetch/axios로 호출하면 Google 리다이렉트 과정에서 CORS 오류 발생
 */
export const getGoogleLoginUrl = (): string => `${API_BASE_URL}/api/v1/auth/login`;

/**
 * 내 정보 조회 (GET /api/v1/users/me)
 * JWT를 직접 해석하지 않고, 사용자 정보는 항상 이 API로 받는다.
 */
export const fetchMe = async (): Promise<HostUser> => {
  const res = await hostClient.get<ApiResponse<HostUser>>('/api/v1/users/me');
  return res.data.data;
};

/**
 * 로그아웃 (POST /api/v1/auth/logout)
 * 서버가 refresh_token을 폐기하고 쿠키를 지움. Bearer + 쿠키가 모두 필요
 */
export const requestLogout = async (): Promise<void> => {
  await hostClient.post('/api/v1/auth/logout');
};