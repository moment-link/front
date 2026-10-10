import React from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';

const Button = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: ${({ $active, theme }) => ($active ? theme.colors.sunken : theme.colors.surface)};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.accentLine : theme.colors.border)};
  ${typography.label}
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.2s ease;
`;

/**
 * 유저 반응 이모지 4종 전용 버튼 (❤️, 😂, 🔥, 👏)
 */
export const ReactionButton: React.FC<{ emoji: string; count: number; active?: boolean; onClick?: () => void }> = ({
  emoji,
  count,
  active,
  onClick,
}) => (
  <Button $active={active} onClick={onClick}>
    <span>{emoji}</span>
    <span>{count}</span>
  </Button>
);