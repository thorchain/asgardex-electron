import styled from 'styled-components'

import { AddressEllipsis as UIAddressEllipsis } from '../addressEllipsis'
import { Modal as UIModal } from '../modal'

export const QRCodeModal = styled(UIModal).attrs({
  okButtonProps: { autoFocus: true }
})`
  text-transform: none;
`

export const AddressContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
  margin-top: 20px;
`

const ICON_SIZE = 20

export const AddressEllipsis = styled(UIAddressEllipsis)`
  max-width: 100%;
  overflow: hidden;
  font-size: 1rem;

  &:only-child {
    margin: auto;
  }

  & svg {
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`
