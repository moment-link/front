// src/services/authApi.ts
// 주최자 인증 API 모음 (현재는 로그인 시작 URL만 제공, 내 정보·로그아웃은 로그인 연결 단계에서 추가)

// api.ts와 동일한 규칙: 값이 없으면 빈 문자열(상대 경로 → Vite 프록시)
// 주의: 로그인은 state·refresh_token 쿠키를 API 도메인에 심으므로, 로컬(localhost:5173)에서 원격 API로
//       끝까지 로그인이 되는지는 백엔드 설정(redirect URI, 쿠키 SameSite/Domain)에 달려 있다.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * 구글 로그인 시작 URL
 * - 반드시 페이지 이동(window.location.href)으로만 사용한다.
 * - fetch/axios로 호출하면 Google 리다이렉트 과정에서 CORS 오류가 발생한다.
 */
export const getGoogleLoginUrl = (): string => `${BASE_URL}/api/v1/auth/login`;
