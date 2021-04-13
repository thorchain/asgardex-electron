import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Container = styled('div')`
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: solid ${palette('background', 0)};
  padding: 5px 10px;
  text-transform: uppercase;
`
