import React from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';

const Container = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 2px;
`;

const TabItem = styled.button<{ $active: boolean }>`
  flex: 1;
  height: 36px;
  border-radius: 6px;
  ${typography.label}
  color: ${({ $active, theme }) => ($active ? theme.colors.text : theme.colors.text3)};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.sunken : 'transparent')};
  border: ${({ $active, theme }) => ($active ? `1px solid ${theme.colors.accentLine}` : '1px solid transparent')};
  transition: all 0.2s ease;
`;

export interface TabOption {
  key: string;
  label: string;
}

/**
 * 세그먼트 형태의 탭 전환 컴포넌트 (전체 · 열림 · 종료)
 */
export const SegmentedTab: React.FC<{ options: TabOption[]; activeKey: string; onChange: (key: string) => void }> = ({
  options,
  activeKey,
  onChange,
}) => (
  <Container>
    {options.map((opt) => (
      <TabItem key={opt.key} $active={activeKey === opt.key} onClick={() => onChange(opt.key)}>
        {opt.label}
      </TabItem>
    ))}
  </Container>
);