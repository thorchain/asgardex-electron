import styled from 'styled-components'

import { sizes } from '../coinIcon/CoinIcon.style'
import { Size as CoinSize } from '../coinIcon/types'

type CoinWrapperProps = {
  size: CoinSize
}

export const CoinWrapper = styled.div<CoinWrapperProps>`
  width: ${({ size }) => `${sizes[size]}px`};
  height: ${({ size }) => `${sizes[size]}px`};
  min-width: ${({ size }) => `${sizes[size]}px`};
  min-height: ${({ size }) => `${sizes[size]}px`};
  border-radius: 50%;

  .coinIcon-wrapper {
    width: 100%;
    height: 100%;
    img {
      width: 100%;
      height: 100%;
    }
  }
`

type CoinsWrapperProps = {
  size: CoinSize
}

export const CoinsWrapper = styled.div<CoinsWrapperProps>`
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
