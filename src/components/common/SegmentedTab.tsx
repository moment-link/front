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
  cursor: pointer;
  transition: all 0.2s ease;
`;

export interface TabOption {
  key: string;
  label: string;
}

/**
 * SegmentedTab 컴포넌트 Props 인터페이스
 * @property options 탭 목록 배열 [{ key: 'latest', label: '최신순' }]
 * @property activeKey 현재 선택된 탭 key
 * @property onChange 탭 변경 핸들러 함수
 */
export interface SegmentedTabProps {
  options: TabOption[];
  activeKey: string;
  onChange: (key: string) => void;
}

/**
 * 세그먼트 스위치 형태의 탭 전환 컴포넌트 (최신순 · 인기순 / 전체 · 열림 · 종료)
 * @example
 * <SegmentedTab
 *   options={[{ key: 'latest', label: '최신순' }, { key: 'popular', label: '인기순' }]}
 *   activeKey={sort}
 *   onChange={(k) => setSort(k)}
 * />
 */
export const SegmentedTab: React.FC<SegmentedTabProps> = ({
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