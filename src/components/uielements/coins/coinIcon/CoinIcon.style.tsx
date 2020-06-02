import styled from 'styled-components'
import { palette, key } from 'styled-theme'

import { Size, Sizes } from './types'

type CoinIconWrapperProps = {
  size: Size
}

const sizes: Sizes = {
  big: key('sizes.coin.big', '40px'),
  small: key('sizes.coin.small', '30px')
}

export const CoinIconWrapper = styled.div`
  width: ${(props: CoinIconWrapperProps) => sizes[props.size]};
  height: ${(props: CoinIconWrapperProps) => sizes[props.size]};

  img {
    width: ${(props: CoinIconWrapperProps) => sizes[props.size]};
    height: ${(props: CoinIconWrapperProps) => sizes[props.size]};
    border-radius: 50%;
    box-shadow: 0px 2px 4px ${palette('secondary', 1)};
    vertical-align: top; /* bug in coin alignment */
  }

  .blue-circle {
    width: ${(props: CoinIconWrapperProps) => sizes[props.size]};
    height: ${(props: CoinIconWrapperProps) => sizes[props.size]};
    background-color: ${palette('secondary', 0)};
    border-radius: 50%;
  }
  .confirm-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${(props: CoinIconWrapperProps) => sizes[props.size]};
    height: ${(props: CoinIconWrapperProps) => sizes[props.size]};
    background-color: ${palette('success', 0)};
    border-radius: 50%;
    svg {
      color: ${palette('background', 1)};
    }
  }
`
