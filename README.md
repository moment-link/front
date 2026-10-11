# Moment Link Frontend

행사 사진·영상 수집 및 공유 서비스 **Moment Link**의 프론트엔드 저장소입니다.

참가자는 별도의 회원가입 없이 QR 코드로 접속하여 사진과 영상을 촬영 및 업로드할 수 있으며, 주최자는 수집된 미디어를 실시간으로 관리하고 공유 앨범, 실시간 포토월, Moment 카드 등을 운영할 수 있습니다.

## Domains & Service URLs

- **Frontend Domain**: `https://momentlink.org`
- **Backend API Domain**: `https://api.momentlink.org`

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | React |
| Build Tool | Vite |
| Language | TypeScript |
| Styling | styled-components |
| Package Manager | npm |
| Linter | ESLint |

## Features

### Participant
- QR 코드 및 공유 링크 기반 접속
- Web Camera API 기반 촬영 및 파일 다중 선택 업로드
- Presigned URL 기반 S3 직전송 및 파일별 업로드 진행률 확인
- 승인된 사진 공유 앨범 조회 및 실시간 포토월 영역 연동
- 1인 1개 사진 좋아요(리액션) 등록 및 인기 순위 확인
- 주최자 허용 시 원본 사진 다운로드
- 시간대별/구역별 사진 묶음(Moment 카드) 조회
- 행사 종료 후 결과 아카이브 열람

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
- **카메라 제어 API**: Web Camera API (`navigator.mediaDevices.getUserMedia`)
- **Fallback 처리**: 카메라 미지원 기기 또는 권한 거절 시 기기 파일 선택(앨범) 화면으로 자동 전환

## Project Structure

```text
src/
├── assets/                # 이미지, 아이콘 등 정적 자원
├── components/            # UI 컴포넌트
│   ├── common/            # 주최자·참가자 공통 UI 컴포넌트
│   ├── host/              # 주최자 전용 컴포넌트
│   └── participant/       # 참가자 전용 컴포넌트 (CameraView, PhotoCard 등)
├── hooks/                 # Custom Hooks (useCamera, useS3Upload 등)
├── pages/                 # 라우터 페이지
│   ├── host/              # 주최자 화면 (로그인, 행사 생성/상세, 갤러리 등)
│   └── participant/       # 참가자 화면 (접속, 업로드, 앨범, 아카이브 등)
├── services/              # API 통신 함수 (participantApi, uploadApi, albumApi 등)
├── styles/                # 전역 스타일 및 테마
├── types/                 # TypeScript 타입 정의 (participant.ts, upload.ts 등)
├── utils/                 # 유틸리티 함수 (fileValidation 등)
├── App.tsx                # 최상위 애플리케이션 컴포넌트 및 라우터 설정
└── main.tsx               # 애플리케이션 진입점
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

### 3. Run

```bash
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:5173
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | TypeScript 검사 및 프로덕션 빌드 |
| `npm run lint` | ESLint 코드 검사 |
| `npm run preview` | 빌드 결과 미리보기 |

## Branch Strategy

```text
main                         # 안정 버전
develop                      # 개발 통합 브랜치
feat/participant-*           # 참가자 기능 개발
feat/host-*                  # 주최자 기능 개발
fix/*                        # 버그 수정
```

### Branch Examples

```text
feat/participant-upload
feat/participant-album
feat/participant-reaction
feat/host-dashboard
feat/host-photo-management
feat/photo-wall
```

## Commit Convention


| Type | Description | Example |
| --- | --- | --- |
| `feat` | 새로운 기능 추가 | `참가자 카메라 촬영 컴포넌트 추가` |
| `fix` | 버그 수정 | `S3 업로드 중복 요청 예외 처리` |
| `style` | UI 스타일 및 레이아웃 수정 (코드 로직 변경 없음) | `참가자 공유 앨범 Grid 레이아웃 수정` |
| `refactor` | 코드 구조 개선 (기능 변경 없음) | `PhotoCard 컴포넌트 좋아요 로직 분리` |
| `docs` | 문서 수정 | `README 및 개발 컨벤션 업데이트` |
| `chore` | 빌드 설정, 패키지, 폴더 구조 등 기타 작업 | `참가자 파트 폴더 구조 생성` |



## Code & Development Rules

- **Naming Convention**
  - **Component / Page**: `PascalCase` (예: `PhotoCard.tsx`, `EventJoinPage.tsx`)
  - **Custom Hooks**: `camelCase` + `use` 접두사 (예: `useCamera.ts`, `useS3Upload.ts`)
  - **Utilities / Services**: `camelCase` (예: `fileValidation.ts`, `participantApi.ts`)
- **TypeScript**: 모든 API 응답, 컴포넌트 Props, 세션 데이터는 `src/types/` 내 인터페이스 명시 필수


## Team Scope

| Area | Scope |
| --- | --- |
| Participant Frontend | 사진·영상 업로드, 공유 앨범, 리액션, 사진 저장, 결과 페이지 |
| Host Frontend | 행사 관리, 사진 관리, 포토월, Moment 카드, 주최자 권한 관리 |git add README.md