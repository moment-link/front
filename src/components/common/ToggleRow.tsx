import React from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Label = styled.span`
  ${typography.section}
  color: ${({ theme }) => theme.colors.text};
`;

const SubText = styled.span`
  ${typography.caption}
  color: ${({ theme }) => theme.colors.text3};
`;

/* 46x28 스위치 스타일 */
const Switch = styled.button<{ $checked: boolean }>`
  width: 46px;
  height: 28px;
  border-radius: 14px;
  background-color: ${({ $checked, theme }) => ($checked ? theme.colors.accentBadge : theme.palette.neutral[800])};
  position: relative;
  transition: background-color 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${({ $checked }) => ($checked ? '21px' : '3px')};
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.text};
    transition: left 0.2s ease;
  }
`;

/**
 * 설정 옵션 토글 스위치 행 컴포넌트 (참가자 다운로드 허용 설정 등)
 */
export const ToggleRow: React.FC<{ label: string; subText?: string; checked: boolean; onChange: (val: boolean) => void }> = ({
  label,
  subText,
  checked,
  onChange,
}) => (
  <Row>
    <TextGroup>
      <Label>{label}</Label>
      {subText && <SubText>{subText}</SubText>}
    </TextGroup>
    <Switch $checked={checked} onClick={() => onChange(!checked)} />
  </Row>
);