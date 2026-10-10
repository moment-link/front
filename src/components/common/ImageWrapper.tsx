import styled from 'styled-components';

/**
 * 사진 블렌딩(.lighten) 래퍼 컴포넌트
 * 실사진을 바탕 surface/bg와 자연스럽게 섞어주는 블렌드 포맷 적용
 */
export const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: ${({ theme }) => theme.colors.surface};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    mix-blend-mode: lighten;
  }
`;