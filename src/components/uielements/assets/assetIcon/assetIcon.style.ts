import styled from 'styled-components'
import { palette, key } from 'styled-theme'

import { Size } from './types'

type Sizes = {
  [key in Size]: string
}

const sizes: Sizes = {
  big: key('sizes.coin.big', '40px'),
  small: key('sizes.coin.small', '30px')
}

export const AssetIconWrapper = styled.div`
  width: ${({ size }: { size: Size }) => sizes[size || 'big']};
  height: ${({ size }: { size: Size }) => sizes[size || 'big']};

  img {
    width: ${({ size }: { size: Size }) => sizes[size || 'big']};
    height: ${({ size }: { size: Size }) => sizes[size || 'big']};
    border-radius: 50%;
    box-shadow: 0px 2px 4px ${palette('secondary', 1)};
    vertical-align: top; /* bug in coin alignment */
  }

  .blue-circle {
    width: ${({ size }: { size: Size }) => sizes[size || 'big']};
    height: ${({ size }: { size: Size }) => sizes[size || 'big']};
    background-color: ${palette('secondary', 0)};
    border-radius: 50%;
  }
  .confirm-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${({ size }: { size: Size }) => sizes[size || 'big']};
    height: ${({ size }: { size: Size }) => sizes[size || 'big']};
    background-color: ${palette('success', 0)};
    border-radius: 50%;
    svg {
      color: ${palette('background', 1)};
    }
  }
`
