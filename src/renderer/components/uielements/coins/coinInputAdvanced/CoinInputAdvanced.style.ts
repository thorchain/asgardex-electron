import { Input } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const CoinInputAdvancedView = styled(Input)`
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
