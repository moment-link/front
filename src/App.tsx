import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';

// 참가자 파트 페이지 모듈 import
import { EventJoinPage } from './pages/participant/EventJoinPage';
import { EventAlbumPage } from './pages/participant/EventAlbumPage';
import { PhotoUploadPage } from './pages/participant/PhotoUploadPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          {/* 1. 기본 루트 접속 시 데모 참가 페이지로 자동 이동 */}
          <Route path="/" element={<Navigate to="/event/demo-event/join" replace />} />

          {/* 2. QR 접속 및 세션 발급 페이지 (P-01) */}
          <Route path="/event/:shareKey/join" element={<EventJoinPage />} />

          {/* 3. 공유 앨범 메인 페이지 (P-02) */}
          <Route path="/event/:shareKey/album" element={<EventAlbumPage />} />

          {/* 4. 웹 카메라 및 S3 Direct 업로드 페이지 (P-03/P-04) */}
          <Route path="/upload" element={<PhotoUploadPage />} />
          <Route path="/event/:shareKey/upload" element={<PhotoUploadPage />} />

          {/* 5. 예외 경로 처리: 잘못된 접근 시 메인으로 이동 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;