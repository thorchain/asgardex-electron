import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Size, Sizes } from './types'

type IconProps = {
  size: Size
}

const sizes: Sizes = {
  large: '66px',
  big: '58px',
  normal: '42px',
  small: '32px'
}

export const IconWrapper = styled.div<IconProps>`
  width: ${({ size }) => sizes[size]};
  height: ${({ size }) => sizes[size]};
  position: relative;
`

export const IconBG = styled.div<IconProps>`
  width: ${({ size }) => sizes[size]};
  height: ${({ size }) => sizes[size]};
  position: absolute;
  left: 0;
  top: 0;
  background-color: ${palette('gray', 1)};
`

export const IconFallback = styled.div<IconProps>`
  width: ${({ size }) => sizes[size]};
  height: ${({ size }) => sizes[size]};
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ size }) => (size === 'big' ? '12px' : '10px')};
  color: ${palette('text', 3)};
`

export const Icon = styled.img<IconProps>`
  position: absolute;
  left: 0;
  top: 0;
  width: ${({ size }) => sizes[size]};
  height: ${({ size }) => sizes[size]};
  border-radius: 50%;
`
