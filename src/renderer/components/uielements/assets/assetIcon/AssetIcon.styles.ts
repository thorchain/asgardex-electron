import { LoadingOutlined as ALoadingOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Size, Sizes, FontSizes } from './AssetIcon.types'

type IconProps = {
  size: Size
  isSynth: boolean
}

const fontSizes: FontSizes = {
  large: 18,
  big: 11,
  normal: 10,
  small: 8,
  xsmall: 5
}

export const sizes: Sizes = {
  large: 72,
  big: 55,
  normal: 40,
  small: 32,
  xsmall: 20
}

export const borders: Sizes = {
  large: 6,
  big: 5,
  normal: 4,
  small: 3,
  xsmall: 2
}

export const IconWrapper = styled.div<IconProps>`
  width: ${({ size }) => `${sizes[size]}px`};
  /* min-width: ${({ size }) => `${sizes[size]}px`}; */
  height: ${({ size }) => `${sizes[size]}px`};
  border: ${({ isSynth, size }) => (isSynth ? `solid ${borders[size]}px` : `none`)};
  border-color: ${({ isSynth }) => (isSynth ? palette('primary', 0) : 'transparent')};
  border-radius: 50%;
  position: relative;
`

export const LoadingOutlined = styled(ALoadingOutlined)`
  width: 100%;
  height: 100%;
`

export const IconBG = styled.div<IconProps>`
  width: ${({ size, isSynth }) => `${sizes[size] - (isSynth ? 2 : 0) * borders[size]}px`};
  height: ${({ size, isSynth }) => `${sizes[size] - (isSynth ? 2 : 0) * borders[size]}px`};
  position: absolute;
  left: 0;
  top: 0;
  background-color: ${palette('gray', 1)};
`

export const IconFallback = styled.div<IconProps>`
  width: ${({ size, isSynth }) => `${sizes[size] - (isSynth ? 2 : 0) * borders[size]}px`};
  height: ${({ size, isSynth }) => `${sizes[size] - (isSynth ? 2 : 0) * borders[size]}px`};
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
  width: ${({ size, isSynth }) => `${sizes[size] - (isSynth ? 2 : 0) * borders[size]}px`};
  height: ${({ size, isSynth }) => `${sizes[size] - (isSynth ? 2 : 0) * borders[size]}px`};
  border-radius: 50%;
`
