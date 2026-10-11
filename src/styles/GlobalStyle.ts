import { createGlobalStyle } from 'styled-components';

/**
 * 전역 CSS 스타일 초기화 및 기본 테마 바인딩 컴포넌트
 * 
 * - 전체 엘리먼트 box-sizing 초기화
 * - body 기본 배경색(theme.colors.bg) 및 기본 서체(theme.fonts.body) 적용
 * - button, input, textarea 등의 공통 인터랙션 및 포커스 링 스타일 통일
 */
export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.body};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    width: 100%;
    min-height: 100vh;
    background-color: ${({ theme }) => theme.colors.bg};
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    font-family: inherit;
    color: inherit;
  }

  input, textarea {
    font-family: inherit;
    color: inherit;
    background-color: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.accentLine};
    }
  }
`;