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

const Switch = styled.button<{ $checked: boolean }>`
  width: 46px;
  height: 28px;
  border-radius: 14px;
  background-color: ${({ $checked, theme }) => ($checked ? theme.colors.accentBadge : theme.colors.sunken)};
  position: relative;
  border: none;
  cursor: pointer;
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
 * ToggleRow 컴포넌트 Props 인터페이스
 * @property label 설정 항목 제목
 * @property subText 하단 서브 설명문
 * @property checked 토글 활성화 여부
 * @property onChange 토글 변경 핸들러 함수
 */
export interface ToggleRowProps {
  label: string;
  subText?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

/**
 * 설정 옵션 토글 행 컴포넌트 (사진 다운로드 허용 토글 등)
 * @example
 * <ToggleRow
 *   label="사진 다운로드 허용"
 *   subText="참가자가 사진을 저장할 수 있습니다."
 *   checked={allowDownload}
 *   onChange={setAllowDownload}
 * />
 */
export const ToggleRow: React.FC<ToggleRowProps> = ({
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