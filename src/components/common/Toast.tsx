import React from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';

const Container = styled.div<{ $isError?: boolean }>`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.surface};
  /* 에러 상태 시 accent-300 색상 적용 규칙 */
  border: 1px solid ${({ $isError, theme }) => ($isError ? theme.feedback.errorMessage : theme.colors.accentLine)};
  color: ${({ $isError, theme }) => ($isError ? theme.feedback.errorMessage : theme.colors.text)};
  ${typography.body}
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

/**
 * 피드백 및 완료/에러 안내 토스트 메시지 컴포넌트
 */
export const Toast: React.FC<{ message: string; isError?: boolean }> = ({ message, isError }) => (
  <Container $isError={isError}>{message}</Container>
);