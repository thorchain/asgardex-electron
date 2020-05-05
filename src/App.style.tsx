import styled from 'styled-components'

export type Space = 'no' | 'wide'

export type AppWrapperProps = {
  space?: Space
}

export const AppWrapper = styled.div<AppWrapperProps>`
  padding: ${(props) => (props?.space === 'wide' ? '10px' : '0')};
`
