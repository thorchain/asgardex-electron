import { Input } from 'antd'
import styled from 'styled-components'

export const CoinInputAdvancedView = styled(Input)`
  width: 100%;
  background: inherit;
  &.ant-input {
    padding: 0;
    color: inherit;
    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
`
