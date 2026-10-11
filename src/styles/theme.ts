/**
 * Figma 디자인 시스템 기반 전역 테마 객체
 * 
 * - Raw Color Palette: 기본 색상 수치 모음
 * - Service Role Tokens: 컴포넌트 개발 시 실제 매핑하여 사용할 색상 토큰
 * - Status Colors: 행사 상태 (open, closed, pending, processed) 및 라이브 상태
 * - Typography: 폰트 사이즈, 행간, 굵기, 자간 규격 (Inter / Pretendard)
 */
export const theme = {
  /**
   * 1. Raw Color Palette (기본 팔레트)
   * Figma 디자인 시스템에 정의된 기본 색상 단계입니다.
   */
  palette: {
    ground: '#161826',
    surface: '#232532',
    text: '#e9e9ed',
    accent: '#1B2CC1',
    accentLine: '#6a91ff',
    divider: 'rgba(233, 233, 237, 0.16)',

    neutral: {
      100: '#f3f5fe',
      200: '#cfd3e5',
      300: '#b2b6ca',
      400: '#9397ab',
      500: '#75798c',
      600: '#595d6c',
      700: '#3f424d',
      800: '#292b31',
      900: '#1a2853',
    },

    accentScale: {
      100: '#f2f5fe',
      200: '#dee8fe',
      300: '#c2d4fe',
      400: '#98b5fe',
      500: '#6a91ff',
      600: '#4269fa',
      700: '#1B2CC1',
      800: '#22398c',
      900: '#1a2853',
    },
  },

  /**
   * 2. Service Role Tokens (서비스 역할 토큰)
   * 컴포넌트 스타일링 시 직접 바인딩해야 하는 의도 기반 색상 토큰입니다.
   * @example
   * background-color: ${({ theme }) => theme.colors.surface};
   * color: ${({ theme }) => theme.colors.text};
   */
  colors: {
    /** 기본 화면 배경색 (#161826) */
    bg: '#161826',
    /** 카드, 모달, 시트 등 표면 배경색 (#232532) */
    surface: '#232532',
    /** 입력 폼, 선택된 칩 등 함몰된 배경색 (#1a2853) */
    sunken: '#1a2853',
    /** 주 타이틀 및 강조 텍스트 (#e9e9ed) */
    text: '#e9e9ed',
    /** 서브 타이틀 및 메타 텍스트 (#b2b6ca) */
    text2: '#b2b6ca',
    /** 캡션 및 비활성 안내 텍스트 (#9397ab) */
    text3: '#9397ab',
    /** 플레이스홀더 및 각주 텍스트 (#75798c) */
    text4: '#75798c',
    /** 주 버튼 및 브랜드 강조 컬러 (#1B2CC1) */
    primary: '#1B2CC1',
    /** 외곽선 및 보더 포커스 링 (#6a91ff) */
    accentLine: '#6a91ff',
    /** 강조 텍스트 및 선택된 아이콘 (#c2d4fe) */
    accentText: '#c2d4fe',
    /** 은은한 강조 배기라운드 틴트 (#1a2853) */
    accentTint: '#1a2853',
    /** 배지 및 태그 강조 배경 (#22398c) */
    accentBadge: '#22398c',
    /** 기본 경계선 및 구분선 (rgba) */
    border: 'rgba(233, 233, 237, 0.16)',
  },

  /**
   * 3. Status Colors (상태 컬러 명세)
   * 행사 진행 및 승인 처리 상태를 나타내는 색상 명세입니다.
   */
  status: {
    /** 진행 중 (Open) 및 승인 대기 (Pending) 상태 */
    open: {
      bg: '#22398c',      // accent-800
      text: '#f2f5fe',    // accent-100
    },
    /** 종료 (Closed) 및 승인 완료 (Processed) 상태 */
    closed: {
      bg: '#292b31',      // neutral-800
      text: '#f3f5fe',    // neutral-100
    },
    /** 승인 대기 중 (Pending) */
    pending: {
      bg: '#22398c',      // accent-800
      text: '#f2f5fe',    // accent-100
    },
    /** 처리 완료 (Processed) */
    processed: {
      bg: '#292b31',      // neutral-800
      text: '#b2b6ca',    // neutral-300
    },
    /** 아카이브 공개 상태 */
    archivePublic: {
      border: '#6a91ff',  // accent-500 / accent-line
      text: '#c2d4fe',    // accent-300
    },
    /** 실시간 라이브 현황 글로우 이펙트 */
    live: {
      color: '#6a91ff',   // accent-line
      glow: '0 0 8px #6a91ff',
    },
  },

  /**
   * 4. Feedback & Error Rules
   * 검증 및 피드백 메시지용 색상 스펙입니다.
   */
  feedback: {
    errorMessage: '#c2d4fe', // accent-300
  },

  /**
   * 5. Font Family 스펙
   * 서비스 내에서 사용하는 글로벌 서체 스펙입니다.
   */
  fonts: {
    body: `'Inter', 'Pretendard Variable', 'Pretendard', system-ui, -apple-system, sans-serif`,
    mono: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`,
  },

  /**
   * 6. Typography Token Specification (Figma 스펙 반영)
   * Figma 디자인 시스템의 타이포그래피 토큰 값 정의입니다.
   */
  typography: {
    display: {
      fontSize: '28px',
      lineHeight: '1.2',
      fontWeight: 500,
      letterSpacing: '-0.02em',
    },
    title: {
      fontSize: '24px',
      lineHeight: '1.2',
      fontWeight: 500,
      letterSpacing: '-0.02em',
    },
    page: {
      fontSize: '22px',
      lineHeight: '1.25',
      fontWeight: 500,
      letterSpacing: '-0.02em',
    },
    empty: {
      fontSize: '17px',
      lineHeight: '1.35',
      fontWeight: 400,
      letterSpacing: 'normal',
    },
    appbar: {
      fontSize: '16px',
      lineHeight: '1.3',
      fontWeight: 500,
      letterSpacing: 'normal',
    },
    section: {
      fontSize: '15px',
      lineHeight: '1.3',
      fontWeight: 500,
      letterSpacing: 'normal',
    },
    body: {
      fontSize: '14px',
      lineHeight: '1.55',
      fontWeight: 400,
      letterSpacing: 'normal',
    },
    label: {
      fontSize: '13px',
      lineHeight: '1.45',
      fontWeight: 400,
      letterSpacing: 'normal',
    },
    caption: {
      fontSize: '12px',
      lineHeight: '1.5',
      fontWeight: 400,
      letterSpacing: 'normal',
    },
    micro: {
      fontSize: '11px',
      lineHeight: '1.4',
      fontWeight: 400,
      letterSpacing: 'normal',
    },
    mono: {
      fontSize: '12px',
      lineHeight: '1.4',
      fontWeight: 400,
      fontFamily: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`,
      letterSpacing: 'normal',
    },
  },

  /**
   * 7. Responsive Breakpoints
   * 반응형 레이아웃 분기 기준점입니다.
   */
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
};

export type ThemeType = typeof theme;