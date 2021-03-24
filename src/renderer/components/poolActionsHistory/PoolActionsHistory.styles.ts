import styled from 'styled-components'
import { palette } from 'styled-theme'

export const DateContainer = styled.span`
  color: ${palette('text', 0)};
  margin-right: 5px;

  &:last-child {
    margin-right: 0;
  }
`
