import styled from 'styled-components'

import { BackLink as BackLinkUI } from '../../components/uielements/backLink'

export const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const BackLink = styled(BackLinkUI)`
  margin: 0 !important;
`
