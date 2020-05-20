import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Size, Sizes, FontSizes } from './types'

type Props = {
  type?: string
  size?: Size
  className?: string
  startCol: string
  stopCol: string
}

const sizes: Sizes = {
  big: '40px',
  normal: '32px',
  small: '32px'
}

const fontSizes: FontSizes = {
  big: '12px',
  normal: '9px',
  small: '9px'
}

export const DynamicCoinWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  width: ${(props: Props) => sizes[props.size || 'big']};
  height: ${(props: Props) => sizes[props.size || 'big']};
  border-radius: 50%;
  font-size: ${(props: Props) => fontSizes[props.size || 'big']};
  font-weight: bold;
  letter-spacing: 0.3px;

  ${(props: Props) => `background: linear-gradient(45deg, ${props.startCol}, ${props.stopCol})`};
  color: ${palette('text', 3)};
  text-transform: uppercase;
  box-shadow: 0px 2px 4px ${palette('secondary', 1)};
`
