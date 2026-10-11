import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';

import { EventJoinPage } from './pages/participant/EventJoinPage';
import { EventAlbumPage } from './pages/participant/EventAlbumPage';
import { PhotoUploadPage } from './pages/participant/PhotoUploadPage';
import { MomentViewPage } from './pages/participant/MomentViewPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Routes>
          {/* 기본 루트 진입 시 시연용 이벤트 입장 페이지로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/event/demo-event/join" replace />} />

          {/* P-01. 참가자 행사 입장 (QR/공유링크 진입) */}
          <Route path="/event/:shareKey/join" element={<EventJoinPage />} />

          {/* P-02. 공유 앨범 메인 뷰 */}
          <Route path="/event/:shareKey/album" element={<EventAlbumPage />} />

          {/* P-05. Moment 카드 타임라인 뷰 */}
          <Route path="/event/:shareKey/moments" element={<MomentViewPage />} />

          {/* P-03 / P-04. 업로드 및 카메라 촬영 페이지 */}
          <Route path="/upload" element={<PhotoUploadPage />} />
          <Route path="/event/:shareKey/upload" element={<PhotoUploadPage />} />

          {/* 와일드카드 처리 */}
          <Route path="*" element={<Navigate to="/event/demo-event/join" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;