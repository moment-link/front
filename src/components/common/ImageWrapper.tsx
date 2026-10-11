import styled from 'styled-components';

/**
 * 실사진 블렌딩(.lighten) 래퍼 컴포넌트
 * 사진을 바탕 surface/bg 테마 컬러와 자연스럽게 연출할 때 사용합니다.
 * @example
 * <ImageWrapper>
 *   <img src={photoUrl} alt="행사 이미지" />
 * </ImageWrapper>
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