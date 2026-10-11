import { css } from 'styled-components';

/**
 * Figma 디자인 가이드 기준 타이포그래피 스타일 Mixin 모음
 * 
 * styled-components 내부에서 폰트 스타일 적용 시 인라인 속성을 작성하는 대신
 * 아래 Mixin 객체를 그대로 주입하여 디자인 시스템 단일 출처(SSOT)를 유지합니다.
 * 
 * @example
 * const Title = styled.h2`
 *   ${typography.appbar}
 *   color: ${({ theme }) => theme.colors.text};
 * `;
 */
export const typography = {
  /** Display: 로그인, 히어로 대표 텍스트 (28px / 1.2 / 500) */
  display: css`
    font-size: ${({ theme }) => theme.typography.display.fontSize};
    line-height: ${({ theme }) => theme.typography.display.lineHeight};
    font-weight: ${({ theme }) => theme.typography.display.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.display.letterSpacing};
  `,
  /** Title: 행사명, 모달 메인 타이틀 (24px / 1.2 / 500) */
  title: css`
    font-size: ${({ theme }) => theme.typography.title.fontSize};
    line-height: ${({ theme }) => theme.typography.title.lineHeight};
    font-weight: ${({ theme }) => theme.typography.title.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.title.letterSpacing};
  `,
  /** Page: 루트 화면 제목, 대표 숫자 (22px / 1.25 / 500) */
  page: css`
    font-size: ${({ theme }) => theme.typography.page.fontSize};
    line-height: ${({ theme }) => theme.typography.page.lineHeight};
    font-weight: ${({ theme }) => theme.typography.page.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.page.letterSpacing};
  `,
  /** Empty: 빈 상태, 차단 상태 타이틀 (17px / 1.35 / 400) */
  empty: css`
    font-size: ${({ theme }) => theme.typography.empty.fontSize};
    line-height: ${({ theme }) => theme.typography.empty.lineHeight};
    font-weight: ${({ theme }) => theme.typography.empty.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.empty.letterSpacing};
  `,
  /** AppBar: 상단 앱바 타이틀, 카드 헤더 (16px / 1.3 / 500) */
  appbar: css`
    font-size: ${({ theme }) => theme.typography.appbar.fontSize};
    line-height: ${({ theme }) => theme.typography.appbar.lineHeight};
    font-weight: ${({ theme }) => theme.typography.appbar.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.appbar.letterSpacing};
  `,
  /** Section: 섹션 제목, 주요 CTA 라벨 (15px / 1.3 / 500) */
  section: css`
    font-size: ${({ theme }) => theme.typography.section.fontSize};
    line-height: ${({ theme }) => theme.typography.section.lineHeight};
    font-weight: ${({ theme }) => theme.typography.section.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.section.letterSpacing};
  `,
  /** Body: 일반 본문, 입력 필드 값, 리스트 항목 (14px / 1.55 / 400) */
  body: css`
    font-size: ${({ theme }) => theme.typography.body.fontSize};
    line-height: ${({ theme }) => theme.typography.body.lineHeight};
    font-weight: ${({ theme }) => theme.typography.body.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.body.letterSpacing};
  `,
  /** Label: 탭, 배너 정보 행, 버튼 라벨 (13px / 1.45 / 400) */
  label: css`
    font-size: ${({ theme }) => theme.typography.label.fontSize};
    line-height: ${({ theme }) => theme.typography.label.lineHeight};
    font-weight: ${({ theme }) => theme.typography.label.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.label.letterSpacing};
  `,
  /** Caption: 촬영 시각, 부연 설명, 도움말 (12px / 1.5 / 400) */
  caption: css`
    font-size: ${({ theme }) => theme.typography.caption.fontSize};
    line-height: ${({ theme }) => theme.typography.caption.lineHeight};
    font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.caption.letterSpacing};
  `,
  /** Micro: 각주, 태그, 그리드 작성자 닉네임 (11px / 1.4 / 400) */
  micro: css`
    font-size: ${({ theme }) => theme.typography.micro.fontSize};
    line-height: ${({ theme }) => theme.typography.micro.lineHeight};
    font-weight: ${({ theme }) => theme.typography.micro.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.micro.letterSpacing};
  `,
  /** Mono: 파일명, 화면 코드, 공유 키 고정폭 서체 (12px / 1.4 / 400) */
  mono: css`
    font-family: ${({ theme }) => theme.typography.mono.fontFamily};
    font-size: ${({ theme }) => theme.typography.mono.fontSize};
    line-height: ${({ theme }) => theme.typography.mono.lineHeight};
    font-weight: ${({ theme }) => theme.typography.mono.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.mono.letterSpacing};
  `,
};