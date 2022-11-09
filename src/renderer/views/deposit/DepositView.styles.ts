import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { BackLinkButton as BackLinkUI } from '../../components/uielements/button'

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background-color: ${palette('background', 0)};
`

export const TopControlsContainer = styled(A.Row).attrs({
  justify: 'space-between',
  align: 'middle'
})`
  margin-bottom: 20px;
`

export const BackLink = styled(BackLinkUI)`
  margin: 0 !important;
`
