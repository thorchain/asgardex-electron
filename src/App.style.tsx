import styled from 'styled-components'

import 'antd/dist/antd.css'

export type Space = 'no' | 'wide'

export type AppWrapperProps = {
  space: Space
}

export const AppWrapper = styled.div<AppWrapperProps>`
  padding: ${(props) => (props.space === 'no' ? '0' : '10px')};
`
