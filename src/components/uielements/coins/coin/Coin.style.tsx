import styled from 'styled-components'
import { palette } from 'styled-theme'

import { CoinSize } from './types'

type CoinWrapperProps = {
  size: CoinSize
}

export const CoinWrapper = styled.div`
  width: ${(props: CoinWrapperProps) => (props.size === 'small' ? '32px' : '40px')};
  height: ${(props: CoinWrapperProps) => (props.size === 'small' ? '32px' : '40px')};
  min-width: ${(props: CoinWrapperProps) => (props.size === 'small' ? '32px' : '40px')};
  min-height: ${(props: CoinWrapperProps) => (props.size === 'small' ? '32px' : '40px')};
  border-radius: 50%;
  box-shadow: 0px 2px 4px ${palette('secondary', 1)};

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

export const CoinsWrapper = styled.div`
  position: relative;
  min-width: ${(props: CoinsWrapperProps) => (props.size === 'small' ? '64px' : '88px')};
  display: flex;
  align-items: center;

  .coin-bottom,
  .coin-over {
    width: ${(props: CoinsWrapperProps) => (props.size === 'small' ? '32px' : '40px')};
    height: ${(props: CoinsWrapperProps) => (props.size === 'small' ? '32px' : '40px')};
    position: relative;
    border-radius: 50%;
    box-shadow: 0px 2px 4px ${palette('secondary', 1)};
    background-color: ${palette('background', 1)};

    .coinIcon-wrapper {
      width: 100%;
      height: 100%;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }

  .dynamic-bottom,
  .dynamic-over {
    position: relative;
    box-shadow: 0px 2px 4px ${palette('secondary', 1)};
  }

  .coin-over,
  .dynamic-over {
    position: relative;
    left: ${(props: CoinsWrapperProps) => (props.size === 'small' ? '-12px' : '-16px')};
  }
`
