// C:\Users\bohun\dev\front\vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(),
    basicSsl(), // 모바일(갤럭시/아이폰) 웹 카메라 활성화를 위한 HTTPS 적용
  ],
  server: {
    host: true, // 스마트폰 와이파이 접속 허용
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://api.momentlink.org',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});