import React from 'react';
import styled, { css } from 'styled-components';
import { typography } from '../../styles/typography';

/**
 * Button 컴포넌트 Props 인터페이스
 * @property $variant - 버튼 스타일 종류 ('primary': 주요 채우기, 'secondary': 외곽선, 'ghost': 투명)
 * @property $size - 버튼 높이 및 패딩 크기 ('medium': 36px, 'large': 44px - 최소 터치 영역)
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  $variant?: 'primary' | 'secondary' | 'ghost';
  $size?: 'medium' | 'large';
}

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  font-weight: 500;
  transition: opacity 0.2s ease, background-color 0.2s ease;

  /* 크기 세팅: 36px / 44px (Figma 터치 영역 스펙 반영) */
  ${({ $size = 'large' }) =>
    $size === 'medium'
      ? css`
          height: 36px;
          padding: 0 12px;
          ${typography.label}
        `
      : css`
          height: 44px;
          padding: 0 16px;
          ${typography.section}
        `}

  /* 상태별 테마 색상 적용 */
  ${({ $variant = 'primary', theme }) => {
    switch ($variant) {
      case 'primary':
        return css`
          background-color: ${theme.colors.primary}; /* #1B2CC1 */
          color: ${theme.colors.text};
        `;
      case 'secondary':
        return css`
          background-color: ${theme.colors.surface}; /* #232532 */
          color: ${theme.colors.text};
          border: 1px solid ${theme.colors.border};
        `;
      case 'ghost':
        return css`
          background-color: transparent;
          color: ${theme.colors.text2};
        `;
    }
  }}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

/**
 * 공통 버튼 컴포넌트
 */
export const Button: React.FC<ButtonProps> = ({ children, $variant = 'primary',$size = 'large', ...props }) => (
  <StyledButton $variant={$variant} $size={$size} {...props}>
    {children}
  </StyledButton>
);