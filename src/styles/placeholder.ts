import styled from 'styled-components';

/**
 * neutral-600~900과 accent-700~900 사이의 대각 그라디언트 6종
 * 
 * 사진 로딩 전 플레이스홀더나 썸네일 미존재 시 배경으로 사용하는 다크 테마 기반 그라디언트 규격입니다.
 */
export const placeholderGradients = [
  'linear-gradient(135deg, #1a2853 0%, #595d6c 100%)', // accent-900 ~ neutral-600
  'linear-gradient(135deg, #3f424d 0%, #1B2CC1 100%)', // neutral-700 ~ accent-700
  'linear-gradient(135deg, #22398c 0%, #292b31 100%)', // accent-800 ~ neutral-800
  'linear-gradient(135deg, #1a2853 0%, #3f424d 100%)', // accent-900 ~ neutral-700
  'linear-gradient(135deg, #595d6c 0%, #22398c 100%)', // neutral-600 ~ accent-800
  'linear-gradient(135deg, #1B2CC1 0%, #1a2853 100%)', // accent-700 ~ accent-900
];

/**
 * 인덱스나 ID 기반으로 6종 그라디언트 중 하나를 반환하는 헬퍼 함수
 * @param index 순번 또는 무작위 숫자
 * @returns 135도 대각 그라디언트 CSS 문자열
 */
export const getPlaceholderGradient = (index: number = 0) => {
  return placeholderGradients[Math.abs(index) % placeholderGradients.length];
};

/**
 * 실사진 lighten 래퍼 컴포넌트
 * 실사진을 바탕 surface/bg 테마 색상과 자연스럽게 블렌딩해 주는 래퍼입니다.
 * @example
 * <ImageLightenWrapper>
 *   <img src={imageUrl} alt="사진" />
 * </ImageLightenWrapper>
 */
export const ImageLightenWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: ${({ theme }) => theme.colors.surface};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* 실사진을 바탕에 섞어주는 lighten 블렌드 포맷 */
    mix-blend-mode: lighten;
  }
`;