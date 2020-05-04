import styled, { createGlobalStyle } from 'styled-components'

import 'antd/dist/antd.css'

const darkStyles = require('antd/dist/antd.dark.css')
const lightyles = require('antd/dist/antd.css')

export type Space = 'no' | 'wide'

export type AppWrapperProps = {
  space?: Space
}

export const GlobalStyle = createGlobalStyle`
  ${({ isLight }: { isLight: boolean }) => (isLight ? lightyles : darkStyles)};
`

export const AppWrapper = styled.div<AppWrapperProps>`
  padding: ${(props) => (props?.space === 'wide' ? '10px' : '0')};
`
