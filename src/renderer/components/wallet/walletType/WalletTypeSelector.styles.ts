import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as UILabel } from '../../uielements/label'

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`

export const Overlay = styled.div`
  background-color: ${palette('background', 0)};
`

export const OverlayLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  size: 'small'
})`
  cursor: pointer;
  font-family: 'MainFontRegular';
  color: ${palette('text', 2)};

  &:hover,
  &:focus,
  &:active {
    color: ${palette('text', 0)};
  }

  padding: 5px 10px;
`
