// 주최자용 axios 클라이언트 — Bearer 토큰 자동 첨부 + 401이면 갱신 후 1회 재시도

import axios, { type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types/common';
import type { TokenRefreshData } from '../types/auth';
import { API_BASE_URL } from './config';
import { clearAccessToken, getAccessToken, setAccessToken } from './tokenStore';

/** refresh_token 쿠키를 주고받기 위해 withCredentials 필수 */
const baseConfig = { baseURL: API_BASE_URL, withCredentials: true };

/**
 * 토큰 갱신 전용 - 인터셉터가 없는 순정 클라이언트
 * hostClient로 갱신하면 갱신 요청이 401일 때 또 갱신을 시도하는 무한 루프가 생김
 */
const rawClient = axios.create(baseConfig);

/** 주최자 API 호출용 클라이언트 */
export const hostClient = axios.create(baseConfig);

// ───────── 토큰 갱신 (single-flight) ─────────

/** 진행 중인 갱신 요청. 있으면 새로 보내지 않고 이것을 같이 기다림 */
let refreshPromise: Promise<string> | null = null;

/**
 * 세션 갱신: refresh_token 쿠키로 새 Access Token을 받아 메모리에 저장
 * refresh_token은 한 번 쓰면 바뀌므로 동시에 두 번 보내면 두 번째가 실패,
 * 따라서 이미 진행 중이면 같은 Promise를 돌려준다.
 * 실패하면 상태 코드와 상관없이 "로그인 안 됨"으로 본다.
 * @returns 새 Access Token
 */
export const refreshSession = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = rawClient
      .post<ApiResponse<TokenRefreshData>>('/api/v1/auth/token/refresh')
      .then((res) => {
        const { accessToken } = res.data.data;
        setAccessToken(accessToken);
        return accessToken;
      })
      .catch((error: unknown) => {
        clearAccessToken();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// ───────── 인증 실패 알림 ─────────

let authFailureHandler: (() => void) | null = null;

/**
 * 갱신까지 실패했을 때 호출될 함수 등록 (AuthProvider가 등록)
 */
export const setAuthFailureHandler = (handler: (() => void) | null): void => {
  authFailureHandler = handler;
};

// ───────── 인터셉터 ─────────

/** 재시도 여부를 표시하는 플래그를 붙인 요청 설정 */
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// 요청: 토큰이 있으면 Authorization 헤더에 붙인다.
hostClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답: 401이면 갱신 → 원래 요청을 딱 1번만 다시 보낸다.
hostClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const original = error.config as RetriableConfig | undefined;
    const isUnauthorized = error.response?.status === 401;

    // 401이 아니거나, 이미 재시도한 요청이면 그대로 실패시킨다. (무한 재시도 방지)
    if (!isUnauthorized || !original || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      const token = await refreshSession();
      original.headers.Authorization = `Bearer ${token}`;
      return await hostClient(original);
    } catch (refreshError) {
      // 갱신이 실패한 경우만 "세션 만료" 알림. 재시도한 요청 자체의 오류는 그대로 전달
      if (!getAccessToken()) authFailureHandler?.();
      return Promise.reject(refreshError);
    }
  },
);