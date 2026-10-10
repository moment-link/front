export const theme = {
  // 1. Raw Color Palette (기본 팔레트)
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

  // 2. Service Role Tokens (서비스 역할 토큰)
  colors: {
    bg: '#161826',
    surface: '#232532',
    sunken: '#1a2853',
    text: '#e9e9ed',
    text2: '#b2b6ca',
    text3: '#9397ab',
    text4: '#75798c',
    primary: '#1B2CC1',
    accentLine: '#6a91ff',
    accentText: '#c2d4fe',
    accentTint: '#1a2853',
    accentBadge: '#22398c',
    border: 'rgba(233, 233, 237, 0.16)',
  },

  // 3. Status Colors (상태 컬러 명세)
  status: {
    open: {
      bg: '#22398c',      // accent-800
      text: '#f2f5fe',    // accent-100
    },
    closed: {
      bg: '#292b31',      // neutral-800
      text: '#f3f5fe',    // neutral-100
    },
    pending: {
      bg: '#22398c',      // accent-800
      text: '#f2f5fe',    // accent-100
    },
    processed: {
      bg: '#292b31',      // neutral-800
      text: '#b2b6ca',    // neutral-300
    },
    archivePublic: {
      border: '#6a91ff',  // accent-500 / accent-line
      text: '#c2d4fe',    // accent-300
    },
    live: {
      color: '#6a91ff',   // accent-line
      glow: '0 0 8px #6a91ff',
    },
  },

  // 4. Feedback & Error Rules
  feedback: {
    errorMessage: '#c2d4fe', // accent-300
  },

  // 5. Font Family 스펙
  fonts: {
    body: `'Inter', 'Pretendard Variable', 'Pretendard', system-ui, -apple-system, sans-serif`,
    mono: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`,
  },

  // 6. Typography Token Specification (Figma 스펙 반영)
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

  // 7. Responsive Breakpoints
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
};

export type ThemeType = typeof theme;