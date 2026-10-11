import React from 'react';
import styled from 'styled-components';

const StyledIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: transparent;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surface};
  }
`;

/**
 * 아이콘 전용 단일 원형 터치 버튼 컴포넌트 (40x40px 최소 터치 영역 확보)
 * @example
 * <IconButton onClick={handleClose} aria-label="닫기">
 *   <Icon icon="X" $size={20} />
 * </IconButton>
 */
export const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...props
}) => <StyledIconButton {...props}>{children}</StyledIconButton>;