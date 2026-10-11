import React from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

const Dialog = styled.div`
  width: 100%;
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
 * Modal 컴포넌트 Props 인터페이스
 * @property isOpen 모달 표출 여부
 * @property title 모달 상단 타이틀
 * @property onClose 모달 닫기 콜백
 */
export interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * 공통 대화상자(모달/확인 시트) 컴포넌트
 * @example
 * <Modal isOpen={isModalOpen} title="사진 삭제" onClose={() => setOpen(false)}>
 *   <p>정말 삭제하시겠습니까?</p>
 * </Modal>
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
}) => {
  if (!isOpen) return null;
  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Title>{title}</Title>
        {children}
      </Dialog>
    </Overlay>
  );
};