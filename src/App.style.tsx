import { Layout } from 'antd'
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

export const AppLayout = styled(Layout)`
  background: ${palette('background', 3)};
`
