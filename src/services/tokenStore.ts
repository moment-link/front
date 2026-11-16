// Access Token 보관소
// 새로고침하면 사라지지만, refresh_token 쿠키로 다시 발급 가능

let accessToken: string | null = null;

/** 현재 Access Token. 없으면 null */
export const getAccessToken = (): string | null => accessToken;

/** Access Token 저장 */
export const setAccessToken = (token: string): void => {
  accessToken = token;
};

/** Access Token 삭제 (로그아웃&인증 실패 시) */
export const clearAccessToken = (): void => {
  accessToken = null;
};