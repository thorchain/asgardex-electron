import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Container = styled('div')`
  display: flex;
  justify-content: center;
  width: 100%;
  color: ${palette('text', 1)};
  padding: 5px 10px;
  text-transform: uppercase;
`
