import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as UILabel } from '../label'
import { Button as UIButton } from './Button'

export const Label = styled(UILabel).attrs({
  size: 'big',
  color: 'primary'
})`
  font-family: 'MainFontRegular';
  text-transform: uppercase;
  padding: 0;
`

export const Button = styled(UIButton)`
  padding: 0px;
  min-width: auto !important;
  margin-right: 5px;
`

export const InfoLabel = styled.div`
  width: 18px;
  height: 18px;
  margin: 3px;
  border-radius: 9px;
  font-size: 11px;
  text-transform: lowercase;
  border: 1.5px solid ${palette('text', 0)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${palette('text', 0)};
`
