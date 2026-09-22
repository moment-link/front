# Moment Link Frontend

행사 사진·영상 수집 및 공유 서비스 **Moment Link**의 프론트엔드 저장소입니다.

참가자는 QR 코드로 접속해 회원가입 없이 사진과 영상을 업로드할 수 있고, 주최자는 행사 사진을 관리하고 공유 앨범·포토월·Moment 카드 등을 운영할 수 있습니다.

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

- QR 코드 기반 행사 페이지 접속
- 사진·영상 업로드
- 행사 공유 앨범 조회
- 사진 좋아요 또는 리액션
- 사진 저장
- 인기 사진 순위 확인
- 시간대별 사진 클러스터링
- 행사 결과 페이지 조회

### Host

- 행사 생성 및 행사 관리
- QR 코드 및 공유 링크 관리
- 여러 주최자 권한 관리
- 업로드된 사진·영상 관리
- 실시간 포토월 운영
- Moment 카드 및 세션별 앨범 관리
- 공유용 결과 페이지 관리

## Project Structure

```text
src/
├── assets/                 # 이미지, 아이콘, 폰트 등 리소스
├── components/
│   └── common/             # 참가자·주최자가 함께 사용하는 공통 UI
├── pages/
│   ├── participant/        # 참가자 화면
│   └── host/               # 주최자 화면
├── styles/                 # 전역 스타일 및 테마
├── types/                  # TypeScript 타입 정의
├── App.tsx                 # 최상위 애플리케이션 컴포넌트
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

```text
feat: 새로운 기능 추가
fix: 버그 수정
style: UI 스타일 수정
refactor: 코드 구조 개선
docs: 문서 수정
chore: 설정, 패키지, 폴더 구조 등 기타 작업
```

## Team Scope

| Area | Scope |
| --- | --- |
| Participant Frontend | 사진·영상 업로드, 공유 앨범, 리액션, 사진 저장, 결과 페이지 |
| Host Frontend | 행사 관리, 사진 관리, 포토월, Moment 카드, 주최자 권한 관리 |