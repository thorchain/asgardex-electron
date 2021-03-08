import * as A from 'antd'
import styled from 'styled-components'

import { BackLink as BackLinkUI } from '../../components/uielements/backLink'

export const TopControlsContainer = styled(A.Row).attrs({
  justify: 'space-between',
  align: 'middle'
})`
  margin-bottom: 20px;
`

export const BackLink = styled(BackLinkUI)`
  margin: 0 !important;
`
