import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Input = styled(A.Input)`
  width: 100%;
  background: inherit;
  border-color: ${palette('primary', 0)};

  padding: 0;
  color: inherit;
  &:hover {
    border-color: ${palette('primary', 0)};
  }
  &:focus {
    border-color: ${palette('primary', 0)};
    outline: none;
    box-shadow: none;
  }
`
