import styled from 'styled-components'
import { palette } from 'styled-theme'

export type ConnectionColors = 'red' | 'yellow' | 'green'

type ColorMap = {
  [key in ConnectionColors]: string
}
const colors: ColorMap = {
  red: palette('error', 0),
  yellow: palette('warning', 0),
  green: palette('success', 0)
}

type Props = {
  color: ConnectionColors
}

type ConnectionStatusProps = Props & React.HTMLProps<HTMLDivElement>

export const ConnectionStatus = styled.div<ConnectionStatusProps>`
  width: 14px;
  height: 14px;
  border: none;
  border-radius: 50%;
  background-color: ${(props) => colors[props.color] || colors.red};
`
