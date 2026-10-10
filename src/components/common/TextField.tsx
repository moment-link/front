import React from 'react';
import styled from 'styled-components';
import { typography } from '../../styles/typography';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const Label = styled.label`
  ${typography.label}
  color: ${({ theme }) => theme.colors.text2};
`;

const Input = styled.input`
  width: 100%;
  height: 44px; /* 최소 터치 영역 44px */
  padding: 0 12px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  ${typography.body}

  &::placeholder {
    color: ${({ theme }) => theme.colors.text3};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accentLine}; /* #6a91ff 포커스 링 */
  }
`;

/**
 * 텍스트 입력 필드 컴포넌트
 */
export const TextField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, ...props }) => (
  <Container>
    {label && <Label>{label}</Label>}
    <Input {...props} />
  </Container>
);