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
  border: 1px solid ${({ $isError, theme }) => ($isError ? theme.feedback.errorMessage : theme.colors.accentLine)};
  color: ${({ $isError, theme }) => ($isError ? theme.feedback.errorMessage : theme.colors.text)};
  ${typography.body}
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

/**
 * Toast 컴포넌트 Props 인터페이스
 * @property message 알림 문구
 * @property isError 에러 알림 여부 (true 시 에러 피드백 컬러 적용)
 */
export interface ToastProps {
  message: string;
  isError?: boolean;
}

/**
 * 처리 완료 및 에러 상태 안내 팝업 토스트 컴포넌트
 * @example
 * <Toast message="사진이 성공적으로 업로드되었습니다." />
 */
export const Toast: React.FC<ToastProps> = ({ message, isError }) => (
  <Container $isError={isError}>{message}</Container>
);