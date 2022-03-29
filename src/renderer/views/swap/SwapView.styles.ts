import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

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

export const ContentContainer = styled('div')`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center; /*  needed to center Spin horizontally */
  background-color: ${palette('background', 0)};
`
