import { css } from 'styled-components';

export const typography = {
  display: css`
    font-size: ${({ theme }) => theme.typography.display.fontSize};
    line-height: ${({ theme }) => theme.typography.display.lineHeight};
    font-weight: ${({ theme }) => theme.typography.display.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.display.letterSpacing};
  `,
  title: css`
    font-size: ${({ theme }) => theme.typography.title.fontSize};
    line-height: ${({ theme }) => theme.typography.title.lineHeight};
    font-weight: ${({ theme }) => theme.typography.title.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.title.letterSpacing};
  `,
  page: css`
    font-size: ${({ theme }) => theme.typography.page.fontSize};
    line-height: ${({ theme }) => theme.typography.page.lineHeight};
    font-weight: ${({ theme }) => theme.typography.page.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.page.letterSpacing};
  `,
  empty: css`
    font-size: ${({ theme }) => theme.typography.empty.fontSize};
    line-height: ${({ theme }) => theme.typography.empty.lineHeight};
    font-weight: ${({ theme }) => theme.typography.empty.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.empty.letterSpacing};
  `,
  appbar: css`
    font-size: ${({ theme }) => theme.typography.appbar.fontSize};
    line-height: ${({ theme }) => theme.typography.appbar.lineHeight};
    font-weight: ${({ theme }) => theme.typography.appbar.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.appbar.letterSpacing};
  `,
  section: css`
    font-size: ${({ theme }) => theme.typography.section.fontSize};
    line-height: ${({ theme }) => theme.typography.section.lineHeight};
    font-weight: ${({ theme }) => theme.typography.section.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.section.letterSpacing};
  `,
  body: css`
    font-size: ${({ theme }) => theme.typography.body.fontSize};
    line-height: ${({ theme }) => theme.typography.body.lineHeight};
    font-weight: ${({ theme }) => theme.typography.body.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.body.letterSpacing};
  `,
  label: css`
    font-size: ${({ theme }) => theme.typography.label.fontSize};
    line-height: ${({ theme }) => theme.typography.label.lineHeight};
    font-weight: ${({ theme }) => theme.typography.label.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.label.letterSpacing};
  `,
  caption: css`
    font-size: ${({ theme }) => theme.typography.caption.fontSize};
    line-height: ${({ theme }) => theme.typography.caption.lineHeight};
    font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.caption.letterSpacing};
  `,
  micro: css`
    font-size: ${({ theme }) => theme.typography.micro.fontSize};
    line-height: ${({ theme }) => theme.typography.micro.lineHeight};
    font-weight: ${({ theme }) => theme.typography.micro.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.micro.letterSpacing};
  `,
  mono: css`
    font-family: ${({ theme }) => theme.typography.mono.fontFamily};
    font-size: ${({ theme }) => theme.typography.mono.fontSize};
    line-height: ${({ theme }) => theme.typography.mono.lineHeight};
    font-weight: ${({ theme }) => theme.typography.mono.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.mono.letterSpacing};
  `,
};