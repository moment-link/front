# Moment Link Frontend

행사 사진·영상 수집 및 공유 서비스 **Moment Link**의 프론트엔드 저장소입니다.

참가자는 별도의 회원가입 없이 QR 코드로 접속하여 사진과 영상을 촬영 및 업로드할 수 있으며, 주최자는 수집된 미디어를 실시간으로 관리하고 공유 앨범, 실시간 포토월, Moment 카드 등을 운영할 수 있습니다.

## Domains & Service URLs

- **Frontend Domain**: `https://momentlink.org`
- **Backend API Domain**: `https://api.momentlink.org`

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | React 19 |
| Build Tool | Vite (`@vitejs/plugin-basic-ssl` 포함) |
| Language | TypeScript |
| Styling | styled-components |
| HTTP Client | Axios |
| Package Manager | npm |
| Linter | ESLint |

## Features

### Participant
- QR 코드 및 공유 링크 기반 무설치(No-App) 접속 및 HttpOnly 세션 쿠키(`participant_token`) 발급
- 참가자 닉네임 설정(2~20자 직접 입력 또는 랜덤 자동 배정), 서버 프로필 동기화 및 공유 앨범 내 닉네임 변경 모달 지원
- 인앱 카메라 뷰파인더(3×3 격자, 사진 촬영·동영상 녹화 통합) 및 스마트폰 기본 카메라 전환(Two-Track) 지원
- 촬영본 및 업로드 대기열 썸네일 미리보기·개별 삭제 모달 지원
- Presigned URL 기반 S3 직전송(SHA-256 무결성 검증) 및 파일별 실시간 업로드 진행률 확인
- 승인된 사진 공유 앨범 조회 및 무한 루프 터치 스와이프 실시간 포토월 연동
- 사진 상세 뷰어 조회 및 1인 1반응 4종 이모지(❤️, 😂, 🔥, 👏) 토글·취소, 최신순/인기순 정렬 확인
- 주최자 허용 시 Blob 변환 기반 원본 사진 다운로드 및 초상권·개인정보(EXIF) 법적 고지 모달 안내
- 시간대별/구역별 사진 묶음(Moment 카드) 조회 및 행사 종료 후 결과 아카이브 열람

### Host
- Google 계정 OAuth 로그인 및 Google Drive 연동
- 행사 생성 및 설정 (공개 여부, 다운로드 허용, 보존 기간 등)
- 행사별 QR 코드 생성 및 공유 링크 관리
- 업로드된 사진·영상 검토 및 공개 승인/반려
- 참가자 공동 주최자 승격 및 권한 관리
- 행사장 스크린용 실시간 포토월 슬라이드쇼 운영
- 시간대별/구역별 Moment 카드 구성 및 관리

## Camera & Mobile Technical Specs

- **지원 OS 및 타겟 브라우저**
  - **Android**: Google Chrome
  - **iOS**: Apple Safari
- **카메라 제어 및 미디어 녹화 API**
  - **인앱 뷰파인더**: `navigator.mediaDevices.getUserMedia` (FHD 스틸 캡처) 및 `MediaRecorder` (실시간 동영상 녹화)
  - **네이티브 카메라 연동**: `<input type="file" capture="environment" />` 기반 스마트폰 순정 카메라 즉시 전환 지원
- **로컬 모바일 테스트 환경**: `@vitejs/plugin-basic-ssl`을 통해 로컬 네트워크(`https://192.168.x.x:5173`)에서도 모바일 브라우저 카메라 권한 활성화 지원
- **Fallback 처리**: 카메라 미지원 환경 또는 권한 거절 시 기기 기본 카메라/파일 선택(앨범) 화면으로 자동 전환

## Project Structure

```text
src/
├── assets/                 # 이미지, 아이콘 등 정적 자원
├── components/             # UI 컴포넌트
│   ├── common/             # 주최자·참가자 공통 UI 컴포넌트 (AppBar, Button, Modal, Icon 등)
│   ├── host/               # 주최자 전용 컴포넌트
│   └── participant/        # 참가자 전용 컴포넌트 (CameraView, PhotoDetailModal, MomentCard 등)
├── hooks/                  # Custom Hooks (useCamera, useS3Upload, useParticipantSession)
├── pages/                  # 라우터 페이지
│   ├── host/               # 주최자 화면 (로그인, 행사 생성/상세, 갤러리 등)
│   └── participant/        # 참가자 화면 (EventJoinPage, EventAlbumPage, MomentViewPage, PhotoUploadPage 등)
├── services/               # API 통신 모듈 (api.ts, authApi.ts, participantApi.ts, uploadApi.ts)
├── styles/                 # 전역 스타일 및 테마 (theme.ts, typography.ts, placeholder.ts, GlobalStyle.ts)
├── types/                  # TypeScript 타입 정의 (participant.ts, upload.ts, album.ts)
├── utils/                  # 유틸리티 함수 (fileValidation 등)
├── App.tsx                 # 최상위 애플리케이션 컴포넌트 및 라우터 설정
└── main.tsx                # 애플리케이션 진입점

```

## Getting Started

### 1. Clone

```bash
git clone [https://github.com/moment-link/front.git](https://github.com/moment-link/front.git)
cd front

```

### 2. Install

```bash
npm install

```

### 3. Environment Setup (`.env.development`)

프로젝트 루트의 `.env.development` (또는 `.env.development.local`) 파일에서 실서버 연동 여부를 제어할 수 있습니다. (Vite Proxy를 통해 `/api` 요청이 `https://api.momentlink.org`로 전달됩니다.)

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=

```

### 4. Run

```bash
npm run dev

```

브라우저 또는 동일 와이파이에 연결된 스마트폰에서 아래 HTTPS 주소로 접속합니다.

```text
Local:   https://localhost:5173
Network: [https://192.168.](https://192.168.)x.x:5173

```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | HTTPS 로컬 및 네트워크 개발 서버 실행 |
| `npm run build` | TypeScript 검사 및 프로덕션 빌드 |
| `npm run lint` | ESLint 코드 검사 |
| `npm run preview` | 빌드 결과 미리보기 |

## Branch Strategy

```text
main                         # 안정 버전
develop                      # 개발 통합 브랜치
feature/participant-*        # 참가자 기능 개발
feature/host-*               # 주최자 기능 개발
fix/*                        # 버그 수정

```

### Branch Examples

```text
feature/participant-album-feed
feature/participant-api-integration
feature/participant-camera-upload
fix/participant-nickname-reaction
feature/host-login
feature/host-dashboard

```

## Commit Convention

| Type | Description | Example |
| --- | --- | --- |
| `feat` | 새로운 기능 추가 | `feat(participant): 인앱 카메라 및 업로드 미리보기 UX 고도화` |
| `fix` | 버그 수정 | `fix(upload): S3 업로드 중복 요청 예외 처리` |
| `style` | UI 스타일 및 레이아웃 수정 (코드 로직 변경 없음) | `style(album): 참가자 공유 앨범 3열 Grid 레이아웃 수정` |
| `refactor` | 코드 구조 개선 (기능 변경 없음) | `refactor(api): 참가자 API 모듈 participantApi로 통합` |
| `docs` | 문서 수정 | `docs: README 및 개발 컨벤션 업데이트` |
| `chore` | 빌드 설정, 패키지, 폴더 구조 등 기타 작업 | `chore: 로컬 HTTPS 플러그인(@vitejs/plugin-basic-ssl) 추가` |

## Code & Development Rules

* **Naming Convention**
* **Component / Page**: `PascalCase` (예: `CameraView.tsx`, `EventJoinPage.tsx`)
* **Custom Hooks**: `camelCase` + `use` 접두사 (예: `useCamera.ts`, `useS3Upload.ts`)
* **Utilities / Services**: `camelCase` (예: `fileValidation.ts`, `participantApi.ts`)


* **TypeScript**: 모든 API 응답, 컴포넌트 Props, 세션 데이터는 `src/types/` 내 인터페이스 명시 필수

## Team Scope

| Area | Scope |
| --- | --- |
| Participant Frontend | QR 입장·세션 발급, 닉네임 동기화·변경, 인앱 카메라·업로드, 공유 앨범, 리액션, 사진 저장, Moment 카드, 아카이브 페이지 |
| Host Frontend | OAuth 로그인, 행사 관리, 사진 승인·관리, 실시간 포토월, Moment 카드 설정, 권한 관리 |

```

---

### 3. GitHub 반영 명령어

두 PR(`#10` 및 `fix/participant-nickname-reaction`)을 `main`에 병합하신 뒤, VS Code 터미널에서 최신 `main` 브랜치를 기준으로 `README.md`를 업데이트해 주십시오.

```powershell
git checkout main
git pull origin main
# README.md 저장 후 실행
git add README.md
git commit -m "docs: README 링크 깨짐 수정 및 참가자 파트 최신 구현 사항 반영"
git push origin main

```
