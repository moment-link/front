import React from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';

const StyledChip = styled.span<{ $selected?: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 14px;
  ${typography.micro}
  color: ${({ $selected, theme }) => ($selected ? theme.colors.text : theme.colors.text3)};
  background-color: ${({ $selected, theme }) => ($selected ? theme.colors.sunken : theme.colors.surface)};
  border: 1px solid ${({ $selected, theme }) => ($selected ? theme.colors.accentLine : theme.colors.border)};
  cursor: pointer;
  transition: all 0.2s ease;
`;

/**
 * Chip 컴포넌트 Props 인터페이스
 * @property label 칩 내부에 표출할 문구
 * @property selected 선택 여부 (활성화 상태 표현)
 */
export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

/**
 * 태그 및 필터링용 칩 컴포넌트
 * @example
 * <Chip label="최신순" selected={true} onClick={handleSelect} />
 */
export const Chip: React.FC<ChipProps> = ({ label, selected, onClick }) => (
  <StyledChip $selected={selected} onClick={onClick}>
    {label}
  </StyledChip>
);