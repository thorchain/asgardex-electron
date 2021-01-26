import styled from 'styled-components'

import { Label as UILabel } from '../label'
import { Button as UIButton } from './Button'

export const Label = styled(UILabel).attrs({
  size: 'normal',
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
