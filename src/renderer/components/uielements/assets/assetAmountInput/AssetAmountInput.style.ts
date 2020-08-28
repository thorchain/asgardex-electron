import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Input = styled(A.Input)`
  width: 100%;
  background: inherit;
  &.ant-input {
    padding: 0;
    color: inherit;
    border-color: ${palette('primary', 0)};
    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
`
