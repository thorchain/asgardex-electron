import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ExternalLinkIcon as ExternalLinkIconUI } from '../uielements/common/Common.styles'
import { Label as UILabel } from '../uielements/label'

export const Label = styled(UILabel)`
  display: block;
  padding: 0px;
  color: ${palette('text', 1)};
  font-family: 'MainFontRegular';
  text-transform: uppercase;
  font-size: 16px;
`

export const ErrorLabel = styled(Label)`
  color: ${palette('error', 1)};
`

export const ExternalLinkIcon = styled(ExternalLinkIconUI)`
  margin-left: 10px;
  color: ${palette('primary', 0)};
  svg {
    color: inherit;
  }
`
