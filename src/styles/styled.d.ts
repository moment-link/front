import 'styled-components';
import { ThemeType } from './theme';

/**
 * styled-components 모듈 타입 확장 정의
 * 
 * 프로젝트 전반에서 `styled-components`의 DefaultTheme 타입을
 * Figma 디자인 토큰이 정의된 `ThemeType`으로 자동 매핑합니다.
 * 
 * 주최자(Host) 및 참가자(Participant) 파트 개발 시 `props.theme.colors` 또는
 * `props.theme.typography` 접근 시 완벽한 Auto-complete와 타입 안전성을 제공합니다.
 */
declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}