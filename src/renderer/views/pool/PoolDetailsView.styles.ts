import styled from 'styled-components'

import { BackLinkButton as BackLinkUI } from '../../components/uielements/button'

export const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const BackLink = styled(BackLinkUI)`
  margin: 0 !important;
`
