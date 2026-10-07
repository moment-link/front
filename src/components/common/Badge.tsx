import React from 'react';
import styled, { css } from 'styled-components';
import { typography } from '../../styles/typography';

/** 행사 및 승인 처리 상태 타입 */
export type StatusType = 'open' | 'closed' | 'pending' | 'processed';

const StyledBadge = styled.span<{ $status: StatusType }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  ${typography.micro} /* 11px / 1.4 / 400 */

  /* 행사 상태별 배경 및 텍스트 색상 분기 (Figma 스펙) */
  ${({ $status, theme }) => {
    switch ($status) {
      case 'open':
      case 'pending':
        return css`
          background-color: ${theme.status.open.bg};
          color: ${theme.status.open.text};
        `;
      case 'closed':
      case 'processed':
        return css`
          background-color: ${theme.status.closed.bg};
          color: ${theme.status.closed.text};
        `;
    }
  }}
`;

/**
 * 상태 표시 전용 배지/태그 컴포넌트
 */
export const Badge: React.FC<{ status: StatusType; label: string }> = ({ status, label }) => (
  <StyledBadge $status={status}>{label}</StyledBadge>
);