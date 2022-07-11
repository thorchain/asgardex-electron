import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: auto;
  background-color: ${palette('background', 0)};
`
