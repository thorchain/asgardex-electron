import styled from 'styled-components'

import { media } from '../../helpers/styleHelper'
import { Alert as UIAlert } from '../uielements/alert'

export const Alert = styled(UIAlert)`
  margin-bottom: 10px;
  ${media.lg`
    margin-bottom: 20px;
  `}
`
