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
 * RadioCard 컴포넌트 Props 인터페이스
 * @property title 카드 제목
 * @property subText 하단 서브 설명 문구
 * @property selected 선택 상태 여부
 * @property onClick 선택 클릭 이벤트
 */
export interface RadioCardProps {
  title: string;
  subText?: string;
  selected: boolean;
  onClick: () => void;
}

/**
 * 라디오 형태의 카드 선택 옵션 컴포넌트 (Moment 세션/장소 선택 등)
 * @example
 * <RadioCard title="메인 홀" subText="10:00 - 12:00" selected={true} onClick={handleSelect} />
 */
export const RadioCard: React.FC<RadioCardProps> = ({
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