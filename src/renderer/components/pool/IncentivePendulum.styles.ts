import styled from 'styled-components'
import { palette } from 'styled-theme'

import { AlertIcon as AlertIconUI } from '../uielements/alert'

export const Container = styled.div``

const ICON_SIZE = 19
export const AlertIcon = styled(AlertIconUI)`
  & svg {
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

export const ContentWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  color: ${palette('text', 1)};
  padding: 0px 10px 5px 10px;
  text-transform: uppercase;
  cursor: default;
`
