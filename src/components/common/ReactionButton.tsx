import React from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';

const Button = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: ${({ $active, theme }) => ($active ? 'rgba(99, 102, 241, 0.2)' : theme.colors.surface)};
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
  ${typography.label}
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
`;

/**
 * ReactionButton 컴포넌트 Props 인터페이스
 * @property emoji 이모지 기호 (❤️, 😂, 🔥, 👏)
 * @property count 해당 이모지의 누적 반응 수
 * @property active 사용자의 활성화/선택 여부
 */
export interface ReactionButtonProps {
  emoji: string;
  count: number;
  active?: boolean;
  onClick?: () => void;
}

/**
 * 유저 반응 이모지 4종 전용 버튼 컴포넌트
 * @example
 * <ReactionButton emoji="❤️" count={12} active={true} onClick={handleToggle} />
 */
export const ReactionButton: React.FC<ReactionButtonProps> = ({
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