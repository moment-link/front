import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.momentlink.org';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 세션 쿠키 전달을 위한 설정
});

// 요청 인터셉터 (필요 시 세션 키 및 공통 헤더 추가)
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (공통 에러 핸들링)
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