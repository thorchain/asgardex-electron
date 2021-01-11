import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as UILabel } from '../label'

type WrapperProps = {
  trend: boolean
}

export const Wrapper = styled.div<WrapperProps>`
  display: flex;
  align-items: center;
  color: ${({ trend }) => (trend ? palette('primary', 0) : palette('error', 0))};
`

export const Label = styled(UILabel)`
  padding: 0 3px;
  width: auto; /* overridden */
`
