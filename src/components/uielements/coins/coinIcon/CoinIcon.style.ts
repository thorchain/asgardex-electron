import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Size, Sizes, FontSizes } from './types'

type IconProps = {
  size: Size
}

const fontSizes: FontSizes = {
  large: 18,
  big: 11,
  normal: 10,
  small: 8
}

export const sizes: Sizes = {
  large: 72,
  big: 55,
  normal: 40,
  small: 32
}

export const IconWrapper = styled.div<IconProps>`
  width: ${({ size }) => `${sizes[size]}px`};
  height: ${({ size }) => `${sizes[size]}px`};
  position: relative;
`

export const IconBG = styled.div<IconProps>`
  width: ${({ size }) => `${sizes[size]}px`};
  height: ${({ size }) => `${sizes[size]}px`};
  position: absolute;
  left: 0;
  top: 0;
  background-color: ${palette('gray', 1)};
`

export const IconFallback = styled.div<IconProps>`
  width: ${({ size }) => `${sizes[size]}px`};
  height: ${({ size }) => `${sizes[size]}px`};
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ size }) => `${fontSizes[size]}px`};
  color: ${palette('text', 3)};
`

export const Icon = styled.img<IconProps>`
  position: absolute;
  left: 0;
  top: 0;
  width: ${({ size }) => `${sizes[size]}px`};
  height: ${({ size }) => `${sizes[size]}px`};
  border-radius: 50%;
`
