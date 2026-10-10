import React from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';

const Card = styled.div<{ $selected: boolean }>`
  padding: 16px;
  border-radius: 12px;
  background-color: ${({ $selected, theme }) => ($selected ? theme.colors.sunken : theme.colors.surface)};
  border: 1px solid ${({ $selected, theme }) => ($selected ? theme.colors.accentLine : theme.colors.border)};
  cursor: pointer;
  transition: all 0.2s ease;
`;

const Title = styled.h4`
  ${typography.section}
  color: ${({ theme }) => theme.colors.text};
`;

const Sub = styled.p`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text2};
  margin-top: 4px;
`;

/**
 * 라디오 카드 형태의 선택형 옵션 컴포넌트 (Moment 세션/장소 선택 등)
 */
export const RadioCard: React.FC<{ title: string; subText?: string; selected: boolean; onClick: () => void }> = ({
  title,
  subText,
  selected,
  onClick,
}) => (
  <Card $selected={selected} onClick={onClick}>
    <Title>{title}</Title>
    {subText && <Sub>{subText}</Sub>}
  </Card>
);