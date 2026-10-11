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
    outline: none;
    border-color: ${({ theme }) => theme.colors.accentLine};
  }
`;

/**
 * TextField 컴포넌트 Props 인터페이스
 * @property label 필드 상단 라벨 문구
 */
export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

/**
 * 표준 텍스트 입력 필드 컴포넌트
 * @example
 * <TextField label="닉네임" placeholder="닉네임을 입력하세요" value={nick} onChange={e => setNick(e.target.value)} />
 */
export const TextField: React.FC<TextFieldProps> = ({ label, ...props }) => (
  <Container>
    {label && <Label>{label}</Label>}
    <Input {...props} />
  </Container>
);