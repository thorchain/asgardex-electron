import styled from 'styled-components'
import { palette } from 'styled-theme'

type SizeType = { [key: string]: string }
const sizes: SizeType = {
  big: '58px',
  normal: '42px',
  small: '32px'
}

type FontSizeType = { [key: string]: string }
const fontSizes: FontSizeType = {
  big: '16px',
  normal: '12px',
  small: '9px'
}

type Props = {
  type: string
  size: string
}

export const DynamicCoinWrapper = styled.div<Props>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${(props) => sizes[props.size]};
  height: ${(props) => sizes[props.size]};
  border-radius: 50%;
  font-size: ${(props) => fontSizes[props.size]};
  font-weight: bold;
  letter-spacing: 0.3px;
  color: ${palette('text', 3)};
  text-transform: uppercase;
  box-shadow: 0px 2px 4px ${palette('secondary', 1)};
`
