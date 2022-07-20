import styled from 'styled-components'
import { palette } from 'styled-theme'

import { AlertIcon as AlertIconUI } from '../uielements/alert'
import { Label as UILabel } from '../uielements/label'

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
  color: ${palette('text', 2)};
  padding: 0px 10px 5px 10px;
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  font-size: 12px;
  cursor: default;
`

export const ErrorLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  align: 'center'
})`
  width: 100%;
  color: ${palette('text', 2)};
  font-size: 12px;
  font-family: 'MainFontRegular';
  padding: 0px 10px 5px 10px;
`
