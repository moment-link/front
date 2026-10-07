import React from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Dialog = styled.div`
  width: calc(100% - 32px);
  max-width: 400px;
  padding: 20px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h3`
  ${typography.title}
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

/**
 * 공통 대화상자(모달/확인 시트) 컴포넌트
 */
export const Modal: React.FC<{ isOpen: boolean; title: string; onClose: () => void; children: React.ReactNode }> = ({
  isOpen,
  title,
  children,
}) => {
  if (!isOpen) return null;
  return (
    <Overlay>
      <Dialog>
        <Title>{title}</Title>
        {children}
      </Dialog>
    </Overlay>
  );
};