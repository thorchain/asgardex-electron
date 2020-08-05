import styled from 'styled-components'
import { palette } from 'styled-theme'

export const ContentContainer = styled('div')`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${palette('background', 0)};
`
