import styled from 'styled-components';

/**
 * 영역 및 컨텐츠 구분선 컴포넌트
 */
export const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: 16px 0;
`;