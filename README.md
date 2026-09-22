# Moment Link

행사 참가자가 QR 코드로 접속해 사진·영상을 업로드하고, 주최자가 이를 수집·관리·공유할 수 있는 웹 서비스입니다.

## 서비스 소개

컨퍼런스, 세미나, 동아리 행사, 기업 행사 등에서 참가자들이 촬영한 사진과 영상을 한곳에 모으고, 행사 종료 후 공유 앨범과 결과 페이지로 다시 볼 수 있도록 돕습니다.

참가자는 회원가입이나 앱 설치 없이 행사 QR 코드를 통해 접속해 사진과 영상을 업로드할 수 있습니다.

주최자는 업로드된 사진을 관리하고, 인기 사진·Moment 카드·실시간 포토월 등을 활용하여 행사를 기록하고 공유할 수 있습니다.

## 주요 기능

### 참가자

- QR 코드로 행사 업로드 페이지 접속
- 회원가입 없이 사진·영상 업로드
- 행사 공유 앨범 조회
- 사진 좋아요 또는 리액션
- 사진 저장
- 인기 사진 순위 확인
- 시간대별 사진 클러스터링 확인
- 행사 결과 페이지 확인

### 주최자

- 행사 생성 및 QR 코드·공유 링크 발급
- 여러 주최자에게 행사 관리 권한 부여
- 업로드된 사진·영상 관리
- 실시간 포토월 운영
- Moment 카드 및 세션별 앨범 관리
- 공유용 결과 페이지 제공

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Framework | React |
| Build Tool | Vite |
| Language | TypeScript |
| Styling | styled-components |
| Package Manager | npm |
| Linter | ESLint |

## 프로젝트 구조

```text
src/
├── assets/                 # 이미지, 아이콘, 폰트 등 정적 리소스
├── components/
│   └── common/             # 공통 UI 컴포넌트
├── pages/
│   ├── participant/        # 참가자 화면
│   └── host/               # 주최자 화면
├── styles/                 # 전역 스타일 및 테마
├── types/                  # TypeScript 타입 정의
├── App.tsx
└── main.tsx
```

## 실행 방법

### 1. 저장소 Clone

```bash
git clone [https://github.com/moment-link/front.git](https://github.com/moment-link/front.git)
cd front
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

실행 후 브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:5173
```

## 브랜치 전략

```text
main                 # 안정된 코드 및 배포 기준 브랜치
develop              # 기능을 통합하는 개발 브랜치
feat/participant-*   # 참가자 기능 개발 브랜치
feat/host-*          # 주최자 기능 개발 브랜치
fix/*                # 버그 수정 브랜치
```

## 팀 역할

| 구분 | 담당 영역 |
| --- | --- |
| Frontend - Participant | 참가자 사진·영상 업로드, 공유 앨범, 리액션, 결과 페이지 |
| Frontend - Host | 행사 생성·관리, 사진 관리, 포토월, Moment 카드 관리 |

## 커밋 메시지 규칙

```text
feat: 새로운 기능 추가
fix: 버그 수정
style: 스타일 수정
refactor: 코드 구조 개선
docs: 문서 수정
chore: 설정, 패키지, 폴더 구조 등 기타 작업
```