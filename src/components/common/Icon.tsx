import React from 'react';
import styled from 'styled-components';
import * as PhosphorIcons from '@phosphor-icons/react';

export type IconSize = 13 | 16 | 18 | 20 | 22 | 40;

interface IconWrapperProps {
  $size?: IconSize;
  $color?: 'text' | 'accent' | 'text2' | 'text3';
}

const IconWrapper = styled.span<IconWrapperProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* 크기 설정 (기본값 20px) */
  font-size: ${({ $size = 20 }) => $size}px;
  width: ${({ $size = 20 }) => $size}px;
  height: ${({ $size = 20 }) => $size}px;

  /* 색상 규칙: 기본 텍스트 색상을 따르고, 액션/타일 등 강조 시 accent 적용 */
  color: ${({ theme, $color = 'text' }) => {
    switch ($color) {
      case 'accent':
        return theme.colors.accentLine; // #6a91ff
      case 'text2':
        return theme.colors.text2;
      case 'text3':
        return theme.colors.text3;
      default:
        return theme.colors.text; // #e9e9ed
    }
  }};

  svg {
    width: 100%;
    height: 100%;
  }
`;

// 반응 이모지 4종 스펙
export const REACTION_EMOJIS = ['❤️', '😂', '🔥', '👏'] as const;

export interface IconProps extends IconWrapperProps {
  icon: keyof typeof PhosphorIcons;
  weight?: 'regular' | 'fill' | 'bold';
}

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