import React from 'react';
import styled from 'styled-components';

const StyledIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface};
  }
`;

/**
 * 아이콘 전용 단일 터치 버튼 컴포넌트
 */
export const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <StyledIconButton {...props}>{children}</StyledIconButton>
);