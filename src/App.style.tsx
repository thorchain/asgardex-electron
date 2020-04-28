import styled from 'styled-components'

import 'antd/dist/antd.css'

export type Space = 'no' | 'wide'

export type AppWrapperProps = {
  space: Space
}

type Props = AppWrapperProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
export const AppWrapper = styled.div<Props>`
  padding: ${(props) => (props.space === 'no' ? '0' : '30px')};
`
