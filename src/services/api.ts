// src/services/api.ts
import axios from 'axios';

// 💡 프록시 설정을 위해 BASE_URL을 빈 문자열(상대 경로)로 변경합니다.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // participant_token 쿠키 전송을 위한 설정
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`[API Error ${error.response.status}]:`, error.response.data);
    } else {
      console.error('[API Network Error]: 네트워크 연결 상태를 확인해주세요.');
    }
    return Promise.reject(error);
  }
);