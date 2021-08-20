import styled from 'styled-components'
import { palette } from 'styled-theme'

const ICON_SIZE = 16

export const AddressCustomRecipient = styled('div')`
  display: flex;
  flex-direction: row;
  font-size: 16px;
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  color: ${palette('text', 1)};
  max-width: 100%;
  margin-right: 5px;
  overflow: hidden;
  &:only-child {
    margin: auto;
  }
  & svg {
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`
