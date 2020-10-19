import styled from 'styled-components'

import { sizes } from '../assetIcon/AssetIcon.style'
import { Size as CoinSize } from '../assetIcon/AssetIcon.types'

type WrapperProps = {
  size: CoinSize
}

export const CoinsWrapper = styled.div<WrapperProps>`
  position: relative;
  width: ${({ size }) => {
    const s = sizes[size]
    const width = s * 2
    const offset = s / 3
    return `${width - offset}px`
  }};
  display: flex;
  align-items: center;

  .coin-bottom,
  .coin-over {
    width: ${({ size }) => `${sizes[size]}px`};
    height: ${({ size }) => `${sizes[size]}px`};
    position: relative;
  }

  .coin-over {
    position: relative;
    left: ${({ size }) => `-${sizes[size] / 3}px`};
  }
`

export const IconOverWrapper = styled.div<WrapperProps>`
  width: ${({ size }) => `${sizes[size]}px`};
  height: ${({ size }) => `${sizes[size]}px`};
  position: relative;
  left: ${({ size }) => `-${sizes[size] / 3}px`};
`

export const IconBottomWrapper = styled.div<WrapperProps>`
  width: ${({ size }) => `${sizes[size]}px`};
  height: ${({ size }) => `${sizes[size]}px`};
  position: relative;
`
