import React from 'react';
import styled from 'styled-components';
import * as PhosphorIcons from '@phosphor-icons/react';

/** Figma 아이콘 크기 규격 타입 */
export type IconSize = 12 | 13 | 16 | 18 | 20 | 22 | 40;

interface StyledIconWrapperProps {
  $size?: IconSize;
  $color?: 'text' | 'accent' | 'text2' | 'text3';
}

const IconWrapper = styled.span<StyledIconWrapperProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: ${({ $size = 20 }) => $size}px;
  width: ${({ $size = 20 }) => $size}px;
  height: ${({ $size = 20 }) => $size}px;

  color: ${({ theme, $color = 'text' }) => {
    switch ($color) {
      case 'accent':
        return theme.colors.accentLine;
      case 'text2':
        return theme.colors.text2;
      case 'text3':
        return theme.colors.text3;
      default:
        return theme.colors.text;
    }
  }};

  svg {
    width: 100%;
    height: 100%;
  }
`;

/** 반응 이모지 4종 규격 */
export const REACTION_EMOJIS = ['❤️', '😂', '🔥', '👏'] as const;

/**
 * Icon 컴포넌트 Props 인터페이스
 * @property icon PhosphorIcons 아이콘 이름
 * @property $size 아이콘 크기 (12, 13, 16, 18, 20, 22, 40)
 * @property $color 색상 토큰
 * @property weight 아이콘 굵기 ('regular' | 'fill' | 'bold')
 */
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: keyof typeof PhosphorIcons;
  $size?: IconSize;
  $color?: 'text' | 'accent' | 'text2' | 'text3';
  weight?: 'regular' | 'fill' | 'bold';
}

/**
 * PhosphorIcons 기반 전역 공통 아이콘 컴포넌트
 * @example
 * <Icon icon="CaretLeft" $size={20}$color="text" />
 */
export const Icon: React.FC<IconProps> = ({
  icon,
  $size = 20,$color = 'text',
  weight = 'regular',
  ...props
}) => {
  const IconComponent = PhosphorIcons[icon] as React.ElementType;

  if (!IconComponent) {
    console.warn(`[Icon] ${String(icon)} 아이콘을 찾을 수 없습니다.`);
    return null;
  }

  return (
    <IconWrapper $size={$size} $color={$color} {...props}>
      <IconComponent weight={weight} />
    </IconWrapper>
  );
};