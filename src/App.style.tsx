import styled from 'styled-components'
import { palette } from 'styled-theme'

export type Space = 'no' | 'wide'

export type AppWrapperProps = {
  space?: Space
}

export const AppWrapper = styled.div<AppWrapperProps>`
  height: 100vh;
  background: ${palette('background', 3)};
  padding: ${(props) => (props?.space === 'wide' ? '10px' : '0')};
`
