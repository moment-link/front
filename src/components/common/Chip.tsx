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
`;

/**
 * 태그 및 필터용 칩 컴포넌트
 */
export const Chip: React.FC<{ label: string; selected?: boolean }> = ({ label, selected }) => (
  <StyledChip $selected={selected}>{label}</StyledChip>
);